"use client";

import { useState, Suspense } from "react";
import { Button } from "@repo/ui/button";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLock } from "react-icons/fi";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Password reset successfully");
      router.push("/auth/signin");
    } catch (error: Error | any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Set New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FiLock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="relative">
          <FiLock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 p-3 rounded-md border focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
