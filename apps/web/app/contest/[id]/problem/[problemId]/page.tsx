import { ProblemStatement } from "../../../../../components/ProblemStatement";
import { ProblemSubmitBar } from "../../../../../components/ProblemSubmitBar";
import { getProblem } from "../../../../db/problem";
import { getContest } from "../../../../db/contest";
import { format } from 'date-fns';

export default async function ProblemPage({
  params: { id, problemId },
}: {
  params: {
    id: string;
    problemId: string;
  };
}) {
  const contest = await getContest(id);
  
  if (!contest) {
    return <div>Contest not found</div>;
  }

  // Check if contest has started
  const now = new Date();
  const startTime = contest.startTime;
  if (now < startTime) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-8 md:py-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Problem Not Available Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This problem will be visible when the contest starts at{" "}
                {format(contest.startTime, "PPpp")}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const problem = await getProblem(problemId, id);

  if (!problem) {
    return <div>Problem not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 md:py-12 grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <div className="prose prose-stone dark:prose-invert">
            <ProblemStatement description={problem.description} />
          </div>
        </div>
        <ProblemSubmitBar 
          problem={problem} 
          contestId={id} 
        />
      </main>
    </div>
  );
}
export const dynamic = "force-dynamic";

