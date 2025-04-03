import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        problem: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json(
      submissions.map((sub: any) => ({
        id: sub.id,
        problemTitle: sub.problem.title,
        status: sub.status,
        submittedAt: sub.createdAt,
      }))
    );

  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
