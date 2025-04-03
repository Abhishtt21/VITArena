import { Prisma } from '@prisma/client';
import { db } from './db';
import { updateContest, updateMemoryAndExecutionTime } from './utils';
type SubmissionWithTestcases = Prisma.SubmissionGetPayload<{
  include: {
    testcases: true;
  };
}>;

async function updateSubmission(queued_Submission: SubmissionWithTestcases) {
  var isAcceptable = true;

  for (const testcase of queued_Submission?.testcases || []) {
    switch (testcase.status_id) {
      case 1:
      case 2:
        // 1 => Queue, 2 => Processing
        // Revisit later if Processing
        isAcceptable = false;
        break;
      case 3:
        // 3 => Accepted
        // Check Next
        break;
      default:
        // ...Others => Errors and UnAccepted
        // Can break the flow immediately
        isAcceptable = false;
        await db.submission.update({
          where: {
            id: queued_Submission.id,
          },
          data: {
            status: "REJECTED",
          },
        });
        return; // Exit early since the flow is broken
    }

    if (!isAcceptable) {
      break;
    }
  }

  if (isAcceptable && queued_Submission?.testcases) {
    await updateMemoryAndExecutionTime(queued_Submission);
    if (queued_Submission?.activeContestId) {
      await updateContest(queued_Submission);
    }
    await db.submission.update({
      where: {
        id: queued_Submission.id,
      },
      data: {
        status: "AC",
      },
    });
  }
}

async function refreshAllLeaderboards() {
  try {
    const activeContests = await db.contest.findMany({
      where: {
        OR: [
          { endTime: { gt: new Date() } }, // Active contests
          { endTime: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Contests ended in last 24h
        ],
      },
    });

    for (const contest of activeContests) {
      await db.$transaction(async (tx) => {
        // Get all submissions for this contest
        const contestSubmissions = await tx.contestSubmission.groupBy({
          by: ['userId'],
          where: { contestId: contest.id },
          _sum: { points: true },
        });

        // Update points and ranks
        const pointsData = contestSubmissions.map(group => ({
          userId: group.userId,
          points: group._sum.points ?? 0,
          contestId: contest.id,
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
              rank: 0,
            },
          });
        }

        // Update ranks
        const sortedPoints = await tx.contestPoints.findMany({
          where: { contestId: contest.id },
          orderBy: { points: 'desc' },
        });

        await Promise.all(
          sortedPoints.map((point, index) =>
            tx.contestPoints.update({
              where: { id: point.id },
              data: { rank: index + 1 },
            })
          )
        );
      });
    }
  } catch (error) {
    console.error('Error refreshing leaderboards:', error);
  }
}

async function runMainLoop() {
  while (true) {
    try {
      const submissions = await db.submission.findMany({
        orderBy: { id: 'desc' },
        take: 20,
        include: { testcases: true },
      });

      for (const submission of submissions || []) {
        await updateSubmission(submission);
      }

      // Refresh leaderboards every 5 minutes
      if (Date.now() % (5 * 60 * 1000) < 1000) {
        await refreshAllLeaderboards();
      }
    } catch (err) {
      console.error("Error during processing:", err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

runMainLoop();

