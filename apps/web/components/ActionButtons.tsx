"use client";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export const ActionButtons = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  return (
    <div className="flex justify-end mr-4 mt-2">
      <Button 
        onClick={() => router.push('/contests/new')}
        className="hover:bg-blue-900 text-white rounded-full shadow-lg"
      >
        Create Contest
      </Button>
    </div>
  );
};



