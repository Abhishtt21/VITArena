import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { db } from "../../../db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contest = await db.contest.findUnique({
      where: { 
        id: params.id,
        deleted: false
      },
      select: { creatorId: true }
    });

    if (!contest) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 }
      );
    }

    if (contest.creatorId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - You can only delete your own contests" },
        { status: 403 }
      );
    }

    // Implement soft delete
    await db.contest.update({
      where: { id: params.id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Contest deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contest:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
