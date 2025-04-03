import Link from "next/link";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@repo/ui/table";
import { CheckIcon } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";

interface ContestProblem {
  problem: {
    id: string;
    title: string;
    difficulty: string;
    solved: number;
  };
}

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: Date | string;
  problems: ContestProblem[];
  contestSubmissions: {
    userId: string;
    problemId: string;
    contestId: string;
    points: number;
  }[];
}

interface ProblemRowProps {
  id: string;
  title: string;
  difficulty: string;
  submissionCount: number;
  contestId: string;
  points: number;
}

export const ContestProblemsTable = ({
  contest,
}: {
  contest: Contest;
}) => {
  const canViewProblems = useMemo(() => {
    if (!contest?.startTime) return false;
    
    const now = new Date();
    // Remove the console.log that was causing the error
    // and add safer date parsing
    const startTimeDate = typeof contest.startTime === 'string' 
      ? new Date(contest.startTime)
      : contest.startTime;
    
    console.log('Current time:', now.toISOString());
    // Only log if we have a valid date
    if (startTimeDate instanceof Date && !isNaN(startTimeDate.getTime())) {
      console.log('Start time:', startTimeDate.toISOString());
    }
    
    return now >= startTimeDate;
  }, [contest?.startTime]);

  if (!canViewProblems) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Problems Not Available Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Problems will be visible when the contest starts at{" "}
            {format(new Date(contest.startTime), "PPpp")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{contest.title}</h2>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Problem</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Solved</TableHead>
                    <TableHead>Your status</TableHead>
                    <TableHead>Solve</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contest.problems.map(({ problem }) => (
                    <ProblemRow
                      key={problem.id}
                      id={problem.id}
                      title={problem.title}
                      difficulty={problem.difficulty}
                      submissionCount={problem.solved}
                      contestId={contest.id}
                      points={
                        contest.contestSubmissions.find(
                          (submission) => submission.problemId === problem.id
                        )?.points || 0
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

function ProblemRow({
  id,
  title,
  difficulty,
  submissionCount,
  contestId,
  points,
}: ProblemRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center justify-between">
          <div className="text-md font-bold">{title}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-500">
          <span className="font-medium">{difficulty}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-500">
          <span className="font-medium">{submissionCount}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-500">
          <span className="font-medium">
            {points ? <CheckIcon className="h-4 w-4 text-green-500" /> : null}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {points > 0 ? (
          <div className="text-green-500 font-medium text-center">Solved</div>
        ) : (
          <Link href={`/contest/${contestId}/problem/${id}`}>
            <Button className="w-full">Solve</Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}

export default ContestProblemsTable;





