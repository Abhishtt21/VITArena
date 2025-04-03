import { Prisma } from "@prisma/client";
import { db } from "./db";
import { getPoints } from "./points";

type SubmissionWithTestcases = Prisma.SubmissionGetPayload<{
  include: {
    testcases: true;
  };
}>;

export async function updateMemoryAndExecutionTime(
  submission: SubmissionWithTestcases
) {
  const pendingTestcases = submission.testcases.filter(
    (testcase) => testcase.status_id === 1 || testcase.status_id === 2
  );
  const failedTestcases = submission.testcases.filter(
    (testcase) => testcase.status_id !== 3
  );

  if (pendingTestcases.length === 0) {
    const accepted = failedTestcases.length === 0;
    submission = await db.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: accepted ? "AC" : "REJECTED",
        time: Math.max(
          ...submission.testcases.map((testcase) =>
            Number(testcase.time ?? "0")
          )
        ),
        memory: Math.max(
          ...submission.testcases.map((testcase) => testcase.memory ?? 0)
        ),
      },
      include: {
        problem: true,
        activeContest: true,
        testcases: true,
      },
    });
  }
}

export async function updateContest(submission: SubmissionWithTestcases) {
  const contestSubmission = await db.submission.findUnique({
    where: { id: submission.id },
    include: {
      activeContest: true,
      problem: true,
    },
  });

  if (!contestSubmission?.activeContestId || !contestSubmission.activeContest?.startTime) return;

  // Calculate and update points for this submission
  const points = await getPoints(
    contestSubmission.activeContestId,
    contestSubmission.userId,
    contestSubmission.problemId,
    contestSubmission.problem.difficulty,
    contestSubmission.activeContest.startTime,
    contestSubmission.activeContest.endTime
  );

  const contestId = contestSubmission.activeContestId;

  // Update or create contest submission
  await db.contestSubmission.upsert({
    where: {
      userId_problemId_contestId: {
        userId: contestSubmission.userId,
        problemId: contestSubmission.problemId,
        contestId,
      },
    },
    update: { points },
    create: {
      userId: contestSubmission.userId,
      problemId: contestSubmission.problemId,
      contestId,
      points,
      submissionId: submission.id,
    },
  });

  // Efficiently update leaderboard in a single transaction
  await db.$transaction(async (tx) => {
    // Get all submissions for this contest
    const contestSubmissions = await tx.contestSubmission.groupBy({
      by: ['userId'],
      where: { contestId },
      _sum: { points: true },
    });

    // Prepare bulk upsert data
    const pointsData = contestSubmissions.map(group => ({
      userId: group.userId,
      points: group._sum?.points ?? 0,
      contestId,
    }));

    // Bulk upsert points
    for (const data of pointsData) {
      await tx.contestPoints.upsert({
        where: {
          contestId_userId: {
            contestId: data.contestId,
            userId: data.userId,
          },
        },
        update: { points: data.points },
        create: {
          contestId: data.contestId,
          userId: data.userId,
          points: data.points,
          rank: 0, // Will be updated in next step
        },
      });
    }

    // Update ranks efficiently
    const sortedPoints = await tx.contestPoints.findMany({
      where: { contestId },
      orderBy: { points: 'desc' },
    });

    // Bulk update ranks
    await Promise.all(
      sortedPoints.map((point, index) =>
        tx.contestPoints.update({
          where: { id: point.id },
          data: { rank: index + 1 },
        })
      )
    );

    // Update contest leaderboard flag if not already set
    if (contestId) {  // Add null check
      await tx.contest.update({
        where: { id: contestId },
        data: { leaderboard: true },
      });
    }
  });
}


