import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { db } from "../../../../db";
import { z } from "zod";
import { transporter } from "../../../../lib/nodemailer";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contest = await db.contest.findUnique({
      where: { id: params.id },
      select: { 
        creatorId: true, 
        isPrivate: true, 
        title: true,
        inviteCode: true,
        creator: {
          select: { name: true }
        }
      }
    });

    if (!contest || !contest.creator || contest.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { emails } = z.object({ emails: z.array(z.string().email()) }).parse(body);

    const users = await db.user.findMany({
      where: { email: { in: emails } }
    });

    const existingEmails = new Set(users.map(u => u.email));

    // Create invitations for existing users
    if (users.length > 0) {
      await db.invitedUser.createMany({
        data: users.map(user => ({
          userId: user.id,
          contestId: params.id
        })),
        skipDuplicates: true
      });
    }

    // Send emails to all users (both registered and non-registered)
    const inviteLink = `${process.env.NEXTAUTH_URL}/contest/join/${contest.inviteCode}`;
    const signupLink = `${process.env.NEXTAUTH_URL}/auth/signup`;
    
    for (const email of emails) {
      const isRegistered = existingEmails.has(email);
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Contest Invitation</h2>
          <p>Hello,</p>
          <p>${contest.creator?.name || "Contest Creator"} has invited you to join the contest: <strong>${contest.title}</strong></p>
          ${!isRegistered ? `
            <p>You'll need to create an account first to participate in the contest.</p>
            <p>
              <a href="${signupLink}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #0070f3; 
                        color: white; text-decoration: none; border-radius: 5px; margin-bottom: 10px;">
                Create Account
              </a>
            </p>
          ` : ''}
          <p>Click the button below to join the contest:</p>
          <p>
            <a href="${inviteLink}" 
               style="display: inline-block; padding: 10px 20px; background-color: #0070f3; 
                      color: white; text-decoration: none; border-radius: 5px;">
              Join Contest
            </a>
          </p>
          <p>Or copy this link: ${inviteLink}</p>
          <p>If you didn't expect this invitation, you can ignore this email.</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Invitation to join ${contest.title}`,
        html: emailTemplate,
      });
    }

    return NextResponse.json({ 
      message: "Invitations sent successfully",
      registered: users.length,
      total: emails.length
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contest = await db.contest.findUnique({
      where: { id: params.id },
      select: { inviteCode: true, isPrivate: true }
    });

    if (!contest || !contest.isPrivate) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ inviteCode: contest.inviteCode });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


