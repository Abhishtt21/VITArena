import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import {getUserRole} from "../../lib/user";
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { db } from "../../db"; // Ensure the correct import path

interface Field {
  type: string;
  name: string;
}

export async function POST(req: NextRequest) {
    // Uncomment and use session validation if needed
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({
            message: "You must be logged in to add a problem",
        }, {
            status: 401,
        });
    }

    // Check if the user is an admin
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

    // Format the problem description with test cases
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
`).join('\n')}`.trim(); // Ensure there are no trailing spaces

    // Insert the problem into the database
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

    // Correct the problem directory path
    const problemDir = path.join('C:/Users/abhis/Downloads/algorithmic-arena-main/algorithmic-arena-main/apps/problems', slug);
    try {
        fs.mkdirSync(problemDir, { recursive: true });

        // Create structure.md file
        const structureMdContent = `Problem Name: "${title}"
Function Name: ${functionName}
Input Structure:
${inputFields.map((field: Field) => `Input Field: ${field.type} ${field.name}`).join('\n')}
Output Structure:
${outputFields.map((field: Field) => `Output Field: ${field.type} ${field.name}`).join('\n')}
`;
        fs.writeFileSync(path.join(problemDir, 'structure.md'), structureMdContent);

        // Create Problem.md file
        const problemMdContent = formattedDescription;
        fs.writeFileSync(path.join(problemDir, 'Problem.md'), problemMdContent);

        // Save test cases and outputs
        const inputsDir = path.join(problemDir, 'tests/inputs');
        const outputsDir = path.join(problemDir, 'tests/outputs');
        fs.mkdirSync(inputsDir, { recursive: true });
        fs.mkdirSync(outputsDir, { recursive: true });

        for (const [index, testCase] of testCases.entries()) {
            const { input, output } = testCase;

            // Save input
            fs.writeFileSync(path.join(inputsDir, `${index}.txt`), input);

            // Save output
            fs.writeFileSync(path.join(outputsDir, `${index}.txt`), output);
        }
    } catch (error: any) {
        console.error(`Error creating files: ${error.message}`);
        return NextResponse.json({
            message: "Error creating files",
        }, {
            status: 500,
        });
    }

    // Call the boilerplate-generator service to generate boilerplate code
    try {
        const generatorScript = `node dist/index.js`;
        const generatorProcess = spawn(generatorScript, {
            cwd: path.resolve('C:/Users/abhis/Downloads/algorithmic-arena-main/algorithmic-arena-main/apps/boilerplate-generator'),
            env: {
                ...process.env,
                GENERATOR_FILE_PATH: `../../problems/${slug}`
            },
            shell: true
        });

        generatorProcess.stdout.on('data', (data:   any) => {
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

            // Run the updateQuestion.ts script to update the database
            try {
                const updateScript = `pnpm dlx ts-node prisma/updateQuestion.ts`;
                const updateProcess = spawn(updateScript, {
                    cwd: path.resolve('C:/Users/abhis/Downloads/algorithmic-arena-main/algorithmic-arena-main/packages/db'),
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