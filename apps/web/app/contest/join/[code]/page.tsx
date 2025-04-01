'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@repo/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui/card';
import { toast } from 'react-toastify';

export default function JoinContest({ params }: { params: { code: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?redirect=/contest/join/${params.code}`);
    }
  }, [status, router, params.code]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch(`/api/contests/join/${params.code}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to join contest');
      
      const data = await response.json();
      toast.success('Successfully joined the contest');
      router.push(`/contest/${data.contestId}`);
    } catch (error) {
      toast.error('Failed to join the contest');
    } finally {
      setIsJoining(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Private Contest</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You're about to join a private contest using an invite code.</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleJoin} 
            disabled={isJoining}
            className="w-full"
          >
            {isJoining ? 'Joining...' : 'Join Contest'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}