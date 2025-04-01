const POINT_MAPPING: Record<string, number> = {
  EASY: 250,
  MEDIUM: 500,
  HARD: 1000,
};

export const getPoints = async (
  contestId: string,
  userId: string,
  problemId: string,
  difficulty: string,
  startTime: Date,
  endTime: Date,
): Promise<number> => {
  const points = POINT_MAPPING[difficulty || "EASY"];
  if(!points) return 0;
  
  // Calculate time taken from contest start to submission
  const timeTaken = Math.abs(new Date().getTime() - startTime.getTime());
  // Total contest duration
  const contestDuration = Math.abs(endTime.getTime() - startTime.getTime());
  
  // Points formula: Base points * (1 + time bonus)
  // Time bonus decreases linearly from 1 to 0 as time taken increases
  const timeBonus = Math.max(0, (contestDuration - timeTaken) / contestDuration);
  const totalPoints = points * (1 + timeBonus);

  return Math.round(totalPoints);
};