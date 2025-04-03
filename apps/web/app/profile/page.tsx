"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";

interface ContestHistory {
  id: string;
  contestId: string;
  title: string;
  rank: number;
  points: number;
  startDate: string;
  endDate: string;
  problemCount: number;
}

interface UserStats {
  problemsSolved: number;
  contestsParticipated: number;
  totalPoints: number;
  bestRank: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [contestHistory, setContestHistory] = useState<ContestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/profile/stats?userId=${session.user.id}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    }

    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    async function fetchContestHistory() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/profile/contests?userId=${session.user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setContestHistory(data.data);
        }
      } catch (error) {
        console.error("Error fetching contest history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchContestHistory();
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section */}
        <div>
          {/* Profile Card - Moved to top */}
          {session?.user && (
            <Card className="p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {session.user.name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {session.user.email}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      Joined 2024
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Preferred Languages
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        Python
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        JavaScript
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Activity Level
                    </h4>
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Profile Information Section */}
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Problems Solved</h3>
                <p className="text-2xl font-bold">{stats?.problemsSolved || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Total Points</h3>
                <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Contests Joined</h3>
                <p className="text-2xl font-bold">{stats?.contestsParticipated || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Best Rank</h3>
                <p className="text-2xl font-bold">{stats?.bestRank || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Contest History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Contest History</h2>
          {loading ? (
            <Card className="p-6">
              <Skeleton className="h-32" />
            </Card>
          ) : contestHistory.length === 0 ? (
            <Card className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                You haven&apos;t participated in any contests yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {contestHistory.map((contest) => (
                <Card key={contest.id} className="p-6">
                  <Link 
                    href={`/standings/${contest.contestId}`}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{contest.title}</h3>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {contest.points} points
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Problems: {contest.problemCount}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







