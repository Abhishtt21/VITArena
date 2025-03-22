"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // For OTP glow

  // For focusing OTP inputs
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const validateForm = () => {
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
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
      toast.success("OTP sent to your email 📩");
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
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      setActiveIndex(index + 1); // Move glowing effect to next OTP input
      otpInputs.current[index + 1]?.focus(); // Focus next input
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        setActiveIndex(index - 1);
        otpInputs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (otp.join("").length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        username: email,
        password,
        name,
        otp: otp.join(""),
        mode: "signup",
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      toast.success("Successfully signed up! 🎉");
      router.push("/");
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
    <motion.div
      className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div className="relative">
          <FiUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <motion.input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            disabled={showOtpInput}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
            whileFocus={{ scale: 1.02 }}
          />
        </div>
        {/* Email Field */}
        <div className="relative">
          <FiMail className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <motion.input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={showOtpInput}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
            whileFocus={{ scale: 1.02 }}
          />
        </div>
        {/* Password Field */}
        <div className="relative">
          <FiLock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={showOtpInput}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        {!showOtpInput ? (
          <Button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        ) : (
          <>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => {
                    otpInputs.current[index] = el;
                  }}
                  title={`OTP digit ${index + 1}`}
                  placeholder="0"
                  className={`w-12 h-12 text-center text-lg border rounded-md outline-none transition-all
                    ${
                      index === activeIndex
                        ? "shadow-lg border-blue-500 animate-glow"
                        : "border-gray-300"
                    }
                  `}
                />
              ))}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </>
        )}
      </form>
      <div className="mt-4 text-center">
        <Link href="/auth/signin" className="text-blue-500 hover:underline">
          Already have an account? Sign In
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
    </motion.div>
  );
}


