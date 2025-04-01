import { db } from "../db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { JWTPayload, SignJWT, importJWK } from "jose";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    token: string;
    role: string;
  }

  interface Session {
    user: User & {
      jwtToken: string;
    }
  }
}

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || "secret";
  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(jwk);
  return jwt;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "name", type: "text", placeholder: "" },
        username: { label: "email", type: "text", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
        mode: { label: "mode", type: "text", placeholder: "" },
        otp: { label: "otp", type: "text", placeholder: "" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.username)) {
          throw new Error("Invalid email format");
        }

        const existingUser = await db.user.findFirst({
          where: { email: credentials.username },
        });

        if (!existingUser) {
          throw new Error("User not found");
        }

        // Verify OTP for both sign-in and sign-up
        if (credentials.otp) {
          if (!existingUser.otp || !existingUser.otpExpiry) {
            throw new Error("No OTP request found");
          }

          if (existingUser.otpExpiry < new Date()) {
            throw new Error("OTP has expired");
          }

          const otpValid = await bcrypt.compare(credentials.otp, existingUser.otp);
          if (!otpValid) {
            throw new Error("Invalid OTP");
          }

          await db.user.update({
            where: { email: credentials.username },
            data: { otp: null, otpExpiry: null },
          });
        } else {
          throw new Error("OTP verification required");
        }

        if (credentials.mode === "signup") {
          if (existingUser.password) {
            throw new Error("User already exists");
          }

          if (!credentials.name || credentials.name.length < 2) {
            throw new Error("Name must be at least 2 characters long");
          }

          try {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const user = await db.user.update({
              where: { email: credentials.username },
              data: {
                name: credentials.name,
                password: hashedPassword,
              },
            });

            const jwt = await generateJWT({ id: user.id });
            return {
              id: user.id,
              name: user.name || "",  // Ensure name is never null
              email: user.email,
              role: user.role,
              token: jwt,
            };
          } catch (e) {
            throw new Error("Failed to create account");
          }
        }

        if (!existingUser.password) {
          throw new Error("Please complete signup first");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        const jwt = await generateJWT({ id: existingUser.id });
        return {
          id: existingUser.id,
          name: existingUser.name || "",  // Ensure name is never null
          email: existingUser.email,
          role: existingUser.role,
          token: jwt,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET || "secr3t",
  
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid as string;
        session.user.jwtToken = token.jwtToken as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.jwtToken = (user as any).token;
        token.role = (user as any).role;
      }
      return token;
    }
  }
};





