"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { toast } from "react-toastify";
import { FiMail } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setEmailSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error: Error | any) {
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
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <p className="text-sm text-gray-500">
            Don't see the email? Check your spam folder.
          </p>
        </div>
      )}
    </div>
  );
}



