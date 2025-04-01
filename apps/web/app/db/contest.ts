import { getServerSession } from "next-auth";
import { db } from ".";
import { authOptions } from "../lib/auth";

export const getContest = async (contestId: string) => {
  const session = await getServerSession(authOptions);
  const contest = await db.contest.findFirst({
    where: {
      id: contestId,
      hidden: false,
      OR: [
        { isPrivate: false },
        { creatorId: session?.user?.id },
        {
          invitedUsers: {
            some: { userId: session?.user?.id }
          }
        }
      ]
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
      contestSubmissions: {
        where: {
          userId: session?.user?.id,
        },
      },
    },
  });
  return contest;
};

export const getContestsWithLeaderboard = async () => {
  const contests = await db.contest.findMany({
    where: {
      leaderboard: true,
    },
  });
  return contests;
};

export const getUpcomingContests = async () => {
  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      deleted: false,
      endTime: {
        gt: new Date(),
      },
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      creatorId: true,
    },
  });
  return contests;
};

export const getExistingContests = async () => {
  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      deleted: false,
      endTime: {
        lt: new Date(),
      },
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      creatorId: true,
    },
  });
  return contests;
};



