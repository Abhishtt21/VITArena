import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get user's contest submissions grouped by contest
    const contestHistory = await db.contestSubmission.groupBy({
      by: ['contestId'],
      where: {
        userId: userId,
      },
      _sum: {
        points: true,
      },
      orderBy: {
        contestId: 'desc',
      },
      take: 10,
    });

    // Fetch contest details for the found submissions
    const contestDetails = await Promise.all(
      contestHistory.map(async (history) => {
        const contest = await db.contest.findUnique({
          where: { id: history.contestId },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            problems: {
              select: {
                problemId: true,
              },
            },
          },
        });

        return {
          id: history.contestId,
          contestId: contest?.id,
          title: contest?.title,
          points: Math.round(history._sum.points || 0),
          startDate: contest?.startTime,
          endDate: contest?.endTime,
          problemCount: contest?.problems.length || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: contestDetails
    });

  } catch (error: any) {
    console.error("Error fetching contest history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contest history" },
      { status: 500 }
    );
  }
}

