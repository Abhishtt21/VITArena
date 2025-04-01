import { Contest } from "../../../components/Contest";
import { getContest } from "../../db/contest";

export default async function ContestPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    return <div>Contest doesn't exist...</div>;
  }

  const contest = await getContest(params.id);
  
  if (!contest) {
    return <div>Contest not found</div>;
  }

  const contestData = {
    id: contest.id,
    title: contest.title,           // Added title
    description: contest.description, // Added description
    creatorId: contest.creatorId,
    isPrivate: contest.isPrivate,
    endTime: contest.endTime.toISOString(),
    problems: contest.problems.map(problem => ({
      problem: {
        id: problem.problem.id,
        title: problem.problem.title,
        difficulty: problem.problem.difficulty,
        solved: problem.problem.solved
      }
    })),
    contestSubmissions: contest.contestSubmissions.map(sub => ({
      userId: sub.userId,
      problemId: sub.problemId,
      contestId: sub.contestId,
      points: sub.points
    }))
  };

  return <Contest id={params.id} initialContest={contestData} />;
}

export const dynamic = "force-dynamic";





