'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import { toast } from 'react-toastify';

export function InviteUsers({ contestId }: { contestId: string }) {
  const [emails, setEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const emailList = emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emailList.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      const response = await fetch(`/api/contests/${contestId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });

      if (!response.ok) throw new Error('Failed to send invitations');
      
      const data = await response.json();
      toast.success(
        `Invitations sent successfully! ${data.registered} of ${data.total} users are already registered.`
      );
      setEmails('');
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const response = await fetch(`/api/contests/${contestId}/invite`);
      if (!response.ok) throw new Error('Failed to get invite code');
      const data = await response.json();
      setInviteCode(data.inviteCode);
    } catch (error) {
      toast.error('Failed to get invite code');
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/contest/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Invite Users</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium mb-2">
              Email Addresses
            </label>
            <textarea
              id="email-input"
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Enter email addresses (comma-separated)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter multiple email addresses separated by commas
            </p>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Invites'}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Or share invite link</h3>
          {!inviteCode ? (
            <Button onClick={fetchInviteCode} variant="outline">
              Generate Invite Link
            </Button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={`${window.location.origin}/contest/join/${inviteCode}`}
                readOnly
                title="Invite Link"
                placeholder="Invite link will appear here"
              />
              <Button onClick={copyInviteLink}>Copy</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


