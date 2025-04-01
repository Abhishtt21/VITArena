"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@repo/ui/card";
import Link from "next/link";
import { parseFutureDate, parseOldDate } from "../app/lib/time";
import { PrimaryButton } from "./LinkButton";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { useState } from "react";

interface ContestCardParams {
  title: string;
  id: string;
  endTime: Date;
  startTime: Date;
  creatorId: string;
}

export function ContestCard({
  title,
  id,
  startTime,
  endTime,
  creatorId,
}: ContestCardParams) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const duration = `${(new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60)} hours`;
  const isActive = startTime.getTime() < Date.now() && endTime.getTime() > Date.now();
  const isCreator = session?.user?.id === creatorId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contest?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contest");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2 items-center">
            {isCreator && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
            {startTime.getTime() < Date.now() &&
            endTime.getTime() < Date.now() ? (
              <div className="text-red-500">Ended</div>
            ) : null}
            {isActive ? <div className="text-green-500">Active</div> : null}
            {endTime.getTime() < Date.now() ? (
              <div className="text-red-500">Ended</div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400">
              {startTime.getTime() < Date.now() ? "Started" : "Starts in"}
            </p>
            <p>
              {startTime.getTime() < Date.now()
                ? parseOldDate(new Date(startTime))
                : parseFutureDate(new Date(startTime))}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Duration</p>
            <p>{duration}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <PrimaryButton href={`/contest/${id}`}>
          {isActive ? "Participate" : "View Contest"}
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}


