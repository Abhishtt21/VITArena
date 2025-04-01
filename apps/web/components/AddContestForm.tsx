"use client";
import { useState, useMemo, useEffect } from 'react';
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Problem {
  id: string;
  title: string;
  difficulty?: string;
  solved?: number;
}

export const AddContestForm = ({ problems }: { problems: Problem[] }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [isPrivate, setIsPrivate] = useState(false);

  const getDifficultyColor = (difficulty: string = 'MEDIUM') => {
    const colors = {
      'EASY': 'text-green-600',
      'MEDIUM': 'text-yellow-600',
      'HARD': 'text-red-600'
    };
    return colors[difficulty as keyof typeof colors] || colors.MEDIUM;
  };

  const getDifficultyBgColor = (difficulty: string = 'ALL') => {
    const colors = {
      'ALL': 'bg-gray-100 hover:bg-gray-200',
      'EASY': 'bg-green-100 hover:bg-green-200',
      'MEDIUM': 'bg-yellow-100 hover:bg-yellow-200',
      'HARD': 'bg-red-100 hover:bg-red-200'
    };
    return colors[difficulty as keyof typeof colors] || colors.ALL;
  };

  const filteredProblems = useMemo(() => {
    const result = difficultyFilter === 'ALL'
      ? problems
      : problems.filter(problem => problem.difficulty === difficultyFilter);
    
    return result;
  }, [problems, difficultyFilter]);

  const handleProblemToggle = (problemId: string) => {
    
    setSelectedProblems(prev => {
      const newState = prev.includes(problemId)
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId];
    
      return newState;
    });
  };

  const handleFilterClick = (difficulty: string) => {
    
    setDifficultyFilter(difficulty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") {
      setMessage('Please wait while we verify your session...');
      return;
    }
    if (!session?.user) {
      setMessage('You must be logged in to create a contest');
      return;
    }
    if (selectedProblems.length === 0) {
      setMessage('Please select at least one problem');
      return;
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setMessage('Invalid date format for start or end time');
      return;
    }
    if (startDate >= endDate) {
      setMessage('Start time must be before end time');
      return;
    }
    setIsSubmitting(true);
    setMessage('');

    fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, startTime, endTime, problems: selectedProblems, isPrivate }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message || 'Failed to create contest'); });
        }
        return response.json();
      })
      .then(data => {
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setSelectedProblems([]);
        router.push(`/contest/${data.contest.id}`);
      })
      .catch(error => {
        setMessage(error.message || 'An error occurred');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    
  }, [difficultyFilter]);

  useEffect(() => {
    
  }, [selectedProblems]);

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4">Create New Contest</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter contest title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded h-32"
            placeholder="Enter contest description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              title="Enter start time"
              placeholder="Enter start time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time:</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              title="Enter end time"
              placeholder="Enter end time"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Problems ({selectedProblems.length} selected):
          </label>
          <div className="flex gap-2 mb-3">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => handleFilterClick(difficulty)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors pointer-events-auto
                  ${difficultyFilter === difficulty ? getDifficultyBgColor(difficulty) + ' ring-2 ring-offset-1' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                {difficulty}
                <span className="ml-2 text-xs">
                  ({problems.filter(p => difficulty === 'ALL' ? true : p.difficulty === difficulty).length})
                </span>
              </button>
            ))}
          </div>
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-200 cursor-pointer pointer-events-auto ${
                  selectedProblems.includes(problem.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleProblemToggle(problem.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={problem.id}
                    checked={selectedProblems.includes(problem.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleProblemToggle(problem.id);
                    }}
                    className="w-4 h-4 text-blue-600 rounded pointer-events-auto"
                  />
                  <label htmlFor={problem.id} className="flex-1">
                    <span className="font-medium">{problem.title}</span>
                  </label>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </span>
                  {problem.solved !== undefined && (
                    <span className="text-gray-500">Solved: {problem.solved}</span>
                  )}
                </div>
              </div>
            ))}
            {filteredProblems.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No problems available for the selected difficulty
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="form-checkbox"
            />
            <span>Make this contest private</span>
          </label>
        </div>
        {message && (
          <div className="mb-4 p-2 rounded bg-red-100 text-red-700">{message}</div>
        )}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedProblems.length === 0 || status === "loading"}
          >
            {isSubmitting ? 'Creating...' : 'Create Contest'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddContestForm;

