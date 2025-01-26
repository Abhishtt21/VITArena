import { LANGUAGE_MAPPING } from "@repo/common/language";
import fs from "fs";
import path from "path";
import prismaClient from "../src";

const prisma = prismaClient;
const MOUNT_PATH = process.env.MOUNT_PATH ?? "C:/Users/abhis/Downloads/algorithmic-arena-main/algorithmic-arena-main/apps/problems";

async function main(problemSlug: string, problemTitle: string) {
  console.log(`Updating problem: ${problemSlug} - ${problemTitle}`);

  try {
    const problemStatement = await promisifedReadFile(
      path.join(MOUNT_PATH, `${problemSlug}/Problem.md`)
    );

    const problem = await prisma.problem.upsert({
      where: {
        slug: problemSlug,
      },
      create: {
        title: problemTitle,
        slug: problemSlug,
        description: problemStatement,
        hidden: false,
      },
      update: {
        description: problemStatement,
      },
    });

    console.log(`Problem upserted successfully: ${problemSlug}`);

    await Promise.all(
      Object.keys(LANGUAGE_MAPPING).map(async (language) => {
        const code = await promisifedReadFile(
          path.join(MOUNT_PATH, `${problemSlug}/boilerplate/function.${language}`)
        );
        await prisma.defaultCode.upsert({
          where: {
            problemId_languageId: {
              problemId: problem.id,
              languageId: LANGUAGE_MAPPING[language].internal,
            },
          },
          create: {
            problemId: problem.id,
            languageId: LANGUAGE_MAPPING[language].internal,
            code,
          },
          update: {
            code,
          },
        });
      })
    );

    console.log(`Boilerplate code upserted successfully for: ${problemSlug}`);
  } catch (error) {
    console.error(`Error updating problem ${problemSlug}:`, error);
  }
}

function promisifedReadFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export function addProblemsInDB() {
  fs.readdir(MOUNT_PATH, (err, dirs) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    dirs.forEach(async (dir) => {
      console.log(`Processing directory: ${dir}`);
      await main(dir, dir);
    });
  });
}

addProblemsInDB();