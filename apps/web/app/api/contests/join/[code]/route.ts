import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../db";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Join attempt:", {
      code: params.code,
      userId: session.user.id
    });

    const contest = await db.contest.findFirst({
      where: { 
        inviteCode: params.code
      }
    });

    console.log("Found contest:", contest);

    if (!contest) {
      return NextResponse.json({ message: "Invalid invite code" }, { status: 404 });
    }

    try {
      await db.invitedUser.create({
        data: {
          userId: session.user.id,
          contestId: contest.id
        }
      });
    } catch (dbError: any) {
      console.error("Database error while creating invitation:", dbError);
      // Check if it's a unique constraint violation (user already invited)
      if (dbError.code === 'P2002') {
        return NextResponse.json({ 
          message: "You're already invited to this contest",
          contestId: contest.id
        });
      }
      throw dbError;
    }

    return NextResponse.json({ 
      message: "Joined contest successfully",
      contestId: contest.id
    });
  } catch (error: any) {
    console.error("Join contest error:", {
      error,
      code: params.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      message: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

