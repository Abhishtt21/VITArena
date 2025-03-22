import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);

console.log(`EMAIL_USER: ${process.env.EMAIL_USER}, EMAIL_PASS: ${process.env.EMAIL_PASS}`);
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user with new OTP
      await db.user.update({
        where: { email },
        data: {
          otp: hashedOtp,
          otpExpiry: expiryTime,
        },
      });
    } else {
      // Create temporary user record
      await db.user.create({
        data: {
          email,
          name: "", // Will be updated during actual signup
          password: "", // Will be updated during actual signup
          otp: hashedOtp,
          otpExpiry: expiryTime,
        },
      });
    }

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>OTP Verification</h2>
          <p>Your OTP for verification is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}


