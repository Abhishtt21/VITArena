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

    const contest = await db.contest.findFirst({
      where: { 
        inviteCode: params.code,
        isPrivate: true
      }
    });

    if (!contest) {
      return NextResponse.json({ message: "Invalid invite code" }, { status: 404 });
    }

    await db.invitedUser.create({
      data: {
        userId: session.user.id,
        contestId: contest.id
      }
    });

    return NextResponse.json({ 
      message: "Joined contest successfully",
      contestId: contest.id
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}