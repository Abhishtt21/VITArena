import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import {getUserRole} from "../../lib/user";
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { db } from "../../db";

interface Field {
  type: string;
  name: string;
}

export async function POST(req: NextRequest) {
    // Session validation remains the same
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({
            message: "You must be logged in to add a problem",
        }, {
            status: 401,
        });
    }

    const userRole = await getUserRole(session.user.id);
    if (userRole !== 'ADMIN') {
        console.log(session.user);
        return NextResponse.json({
            message: "You do not have permission to add a problem",
        }, {
            status: 403,
        });
    }

    const { title, description, difficulty, slug, testCases, functionName, inputFields, outputFields } = await req.json();

    // Format description remains the same
    const formattedDescription = `
### ${title}

${description}

${testCases.map((tc: any, index: number) => `
#### Test case ${index + 1}

Input

\`\`\`
${tc.input}
\`\`\`

Output

\`\`\`
${tc.output}
\`\`\`
`).join('\n')}`.trim();

    // Database insertion remains the same
    try {
        const problem = await db.problem.create({
            data: {
                title,
                description: formattedDescription,
                hidden: false,
                difficulty,
                slug,
            }
        });
        console.log('Problem inserted into the database successfully');
    } catch (error: any) {
        console.error(`Error inserting problem into the database: ${error.message}`);
        return NextResponse.json({
            message: "Error inserting problem into the database",
        }, {
            status: 500,
        });
    }

    // Update the problem directory path for Ubuntu
    const problemDir = path.join(process.env.MOUNT_PATH || '/home/ubuntu/VITArena/apps/problems', slug);
    try {
        fs.mkdirSync(problemDir, { recursive: true });

        // File creation remains the same
        const structureMdContent = `Problem Name: "${title}"
Function Name: ${functionName}
Input Structure:
${inputFields.map((field: Field) => `Input Field: ${field.type} ${field.name}`).join('\n')}
Output Structure:
${outputFields.map((field: Field) => `Output Field: ${field.type} ${field.name}`).join('\n')}
`;
        fs.writeFileSync(path.join(problemDir, 'Structure.md'), structureMdContent);
        fs.writeFileSync(path.join(problemDir, 'Problem.md'), formattedDescription);

        const inputsDir = path.join(problemDir, 'tests/inputs');
        const outputsDir = path.join(problemDir, 'tests/outputs');
        fs.mkdirSync(inputsDir, { recursive: true });
        fs.mkdirSync(outputsDir, { recursive: true });

        for (const [index, testCase] of testCases.entries()) {
            fs.writeFileSync(path.join(inputsDir, `${index}.txt`), testCase.input);
            fs.writeFileSync(path.join(outputsDir, `${index}.txt`), testCase.output);
        }
    } catch (error: any) {
        console.error(`Error creating files: ${error.message}`);
        return NextResponse.json({
            message: "Error creating files",
        }, {
            status: 500,
        });
    }

    // Update paths and commands for Ubuntu
    try {
        const generatorProcess = spawn('node', ['dist/index.js'], {
            cwd: path.resolve('/home/ubuntu/VITArena/apps/boilerplate-generator'),
            env: {
                ...process.env,
                GENERATOR_FILE_PATH: `../../problems/${slug}`
            },
        });

        generatorProcess.stdout.on('data', (data: any) => {
            console.log(`stdout: ${data}`);
        });

        generatorProcess.stderr.on('data', (data: any) => {
            console.error(`stderr: ${data}`);
        });

        generatorProcess.on('close', (code: number) => {
            if (code !== 0) {
                console.error(`Generator process exited with code ${code}`);
                return NextResponse.json({
                    message: "Error generating boilerplate code",
                }, {
                    status: 500,
                });
            }
            console.log('Boilerplate code generated successfully');

            // Update the database update script command for Ubuntu
            try {
                const updateProcess = spawn('pnpm', ['dlx', 'ts-node', 'prisma/updateQuestion.ts'], {
                    cwd: path.resolve('/home/ubuntu/VITArena/packages/db'),
                    shell: true
                });

                updateProcess.stdout.on('data', (data: any) => {
                    console.log(`stdout: ${data}`);
                });

                updateProcess.stderr.on('data', (data: any) => {
                    console.error(`stderr: ${data}`);
                });

                updateProcess.on('close', (code: number) => {
                    if (code !== 0) {
                        console.error(`Update process exited with code ${code}`);
                        return NextResponse.json({
                            message: "Error updating database",
                        }, {
                            status: 500,
                        });
                    }
                    console.log('Database updated successfully');
                    return NextResponse.json({
                        message: "Problem added and database updated successfully",
                    }, {
                        status: 201,
                    });
                });
            } catch (error: any) {
                console.error(`Error updating database: ${error.message}`);
                return NextResponse.json({
                    message: "Error updating database",
                }, {
                    status: 500,
                });
            }
        });
    } catch (error : any) {
        console.error(`Error generating boilerplate code: ${error.message}`);
        return NextResponse.json({
            message: "Error generating boilerplate code",
        }, {
            status: 500,
        });
    }
}
