import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
import { jwtVerify, importJWK } from "jose";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "secret";
    const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });
    const { payload } = await jwtVerify(token, jwk);
    const userId = payload.userId as string;

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        id: userId,
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
