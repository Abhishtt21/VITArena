"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Track the glowing index

  // Initialize the ref array
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("OTP sent to your email");
      setShowOtpInput(true);
      // Focus the first OTP input
      otpInputs.current[0]?.focus();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      setActiveIndex(index + 1); // Move glow to next input
      otpInputs.current[index + 1]?.focus(); // Move cursor to next input
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0) {
        setActiveIndex(index - 1); // Move glow to previous input
        otpInputs.current[index - 1]?.focus(); // Move cursor to previous input
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        username: email,
        password,
        otp: fullOtp,
        redirect: false,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success("Successfully signed in!");
      window.location.href = "/";
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field with Icon */}
        <div className="relative">
          <FiMail className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={showOtpInput}
            className="w-full pl-10 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        {/* Password Field with Icon */}
        <div className="relative">
          <FiLock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={showOtpInput}
            className="w-full pl-10 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="text-right">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        {!showOtpInput ? (
          <Button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        ) : (
          <>
            <div className="flex justify-center gap-2">
              {otp.map((digit: string, index: number) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  ref={(el) => {
                    otpInputs.current[index] = el;
                  }}
                  title={`OTP digit ${index + 1}`}
                  placeholder="0"
                  className={`w-12 h-12 text-center text-lg border rounded-md outline-none transition-all ${
                    index === activeIndex
                      ? "shadow-lg border-blue-500 animate-glow"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
          </>
        )}
      </form>
      <div className="mt-4 text-center">
        <Link href="/auth/signup" className="text-blue-500 hover:underline">
          Don't have an account? Sign Up
        </Link>
      </div>

      {/* Custom Tailwind animation for glowing OTP input */}
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
        }
        .animate-glow {
          animation: glow 1s infinite alternate;
        }
      `}</style>
    </div>
  );
}





