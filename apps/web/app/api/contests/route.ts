import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { db } from "../../db";
import { rateLimit } from "../../lib/rateLimit";
import { z } from "zod";

// Validation schema for contest creation
const createContestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  problems: z.array(z.string()).min(1, "At least one problem is required"),
  isPrivate: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isLimited = await rateLimit(userId, 5, 60);

    if (!isLimited) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = createContestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validatedData.error.errors },
        { status: 400 }
      );
    }

    const { title, description, startTime, endTime, problems, isPrivate } = validatedData.data;

    if (startTime >= endTime) {
      return NextResponse.json(
        { message: "Start time must be before end time" },
        { status: 400 }
      );
    }

    const contest = await db.contest.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        hidden: false,
        creatorId: userId,
        isPrivate,
        leaderboard: true, // Explicitly set to true
        inviteCode: isPrivate ? crypto.randomUUID() : null, // Generate invite code for private contests
        problems: {
          create: problems.map((problemId: string, index: number) => ({
            problemId,
            index,
            id: `${Date.now()}-${index}`,
          })),
        },
      },
      include: {
        problems: true,
      },
    });

    return NextResponse.json(
      { message: "Contest created successfully", contest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contest:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";

    const skip = (page - 1) * limit;

    const contests = await db.contest.findMany({
      where: {
        hidden: false,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        startTime: "desc",
      },
      skip,
      take: limit,
      include: {
        problems: {
          select: {
            problemId: true,
            index: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await db.contest.count({
      where: {
        hidden: false,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      contests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
