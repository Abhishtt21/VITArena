import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main(contestId: string) {
  const userPoints = new Map<string, number>();
  const contestSubmissions = await prisma.contestSubmission.findMany({
    where: {
      contestId: contestId,
    },
    include: {
      user: true,
    },
  });

  contestSubmissions.forEach((submission) => {
    if (userPoints.has(submission.userId)) {
      userPoints.set(
        submission.userId,
        userPoints.get(submission.userId)! + submission.points,
      );
    } else {
      userPoints.set(submission.userId, submission.points);
    }
  });

  const sortedUserPoints = Array.from(userPoints.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  // Just clean existing points without touching the leaderboard flag
  await prisma.contestPoints.deleteMany({
    where: {
      contestId: contestId,
    },
  });

  // Create new points
  await prisma.contestPoints.createMany({
    data: sortedUserPoints.map(([userId, points]) => ({
      userId,
      points: points,
      contestId: contestId,
      rank: sortedUserPoints.map((x) => x[0]).indexOf(userId) + 1,
    })),
  });
}

main(process.env.CONTEST_ID!);

