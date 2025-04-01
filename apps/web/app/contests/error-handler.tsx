'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error === 'unauthorized') {
      toast.error("You don't have access to this contest");
    }
  }, [error]);

  return null;
}