"use client";

import { ContestClock } from "./ContestClock";
import { ContestPoints } from "./ContestPoints";
import { ContestProblemsTable } from "./ContestProblemsTable";
import { InviteUsers } from "./InviteUsers";
import { useSession } from "next-auth/react";
import { getContest } from "../app/db/contest";

interface ContestProps {
  id: string;
  initialContest: {
    id: string;
    title: string;
    description: string;
    creatorId: string | null;
    isPrivate: boolean;
    startTime: string;
    endTime: string;
    problems: {
      problem: {
        id: string;
        title: string;
        difficulty: string;
        solved: number;
      };
    }[];
    contestSubmissions: {
      userId: string;
      problemId: string;
      contestId: string;
      points: number;
    }[];
  };
}

export function Contest({ id, initialContest }: ContestProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const isCreator = session?.user?.id === initialContest.creatorId;
  
  return (
    <div className="grid grid-flow-row-dense gap-4 grid-cols md:grid-cols-12 gap-4 grid-cols-1 min-h-screen px-2 md:px-12">
      <div className="col-span-9">
        <ContestProblemsTable contest={{
          ...initialContest,
          // Ensure we're passing a valid date string
          startTime: initialContest.startTime ? new Date(initialContest.startTime).toISOString() : ""
        }} />
        {isCreator && initialContest.isPrivate && (
          <InviteUsers contestId={initialContest.id} />
        )}
      </div>
      <div className="col-span-3">
        <div className="col-span-3 pt-2 md:pt-24">
          <ContestClock endTime={new Date(initialContest.endTime)} />
        </div>
        <div className="pt-2">
          <ContestPoints
            points={initialContest.contestSubmissions.reduce(
              (acc, curr) => acc + curr.points,
              0,
            )}
          />
        </div>
      </div>
    </div>
  );
}

















