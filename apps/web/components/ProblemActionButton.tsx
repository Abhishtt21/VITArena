"use client";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export const ProblemActionButton = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  return (
    <div className=" right-4 top-1 transform -translate-y-1/2 z-50">
      <Button 
        onClick={() => router.push('/addproblems')}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
      >
        Add Problem
      </Button>
    </div>
  );
};
