import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get unique solved problems (AC submissions)
    const solvedProblems = await db.submission.findMany({
      where: {
        userId: userId,
        status: "AC",
      },
      distinct: ['problemId'],
    });

    // Get contests participated in
    const contestsParticipated = await db.contestSubmission.findMany({
      where: {
        userId: userId,
      },
      distinct: ['contestId'],
    });

    // Get total points from all contests
    const totalPoints = await db.contestPoints.aggregate({
      where: {
        userId: userId,
      },
      _sum: {
        points: true,
      },
    });

    // Get best rank
    const bestRank = await db.contestPoints.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        rank: 'asc',
      },
      select: {
        rank: true,
      },
    });

    return NextResponse.json({
      problemsSolved: solvedProblems.length,
      contestsParticipated: contestsParticipated.length,
      totalPoints: totalPoints._sum.points || 0,
      bestRank: bestRank?.rank || 0,
    });

  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
