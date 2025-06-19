'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Interview } from '@/types/form';
import SummarySkeleton from '@/components/Skeletons/SummarySkeleton';
import { Button } from '@/components/ui/button';
import { BE_URL } from '@/config';

const ITEMS_PER_PAGE = 5;
const PastInterviewPage = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchInterviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`${BE_URL}/api/v1/interview/pastInterview`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userData?.id
          })
        });

        const data = await res.json();

        if (res.ok) {
          setInterviews(data.interviews);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('Error fetching past interviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const totalPages = Math.ceil(interviews.length / ITEMS_PER_PAGE);
  const currentPageItems = interviews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return <SummarySkeleton />;
  }

  if (!interviews.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No past interviews found. Past Interviews are shown if communication was initialised.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Past Interviews</h2>

      <div className="space-y-4">
        {currentPageItems.map((interview) => (
          <div
            key={interview.id}
            className="p-4 rounded-lg border border-border bg-card shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  {interview.position} @ {interview.company}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {interview.type} | {interview.experience} | {interview.specialization}
                </p>
                <p className="text-sm text-muted-foreground">
                  Style: {interview.style} | Duration: {interview.duration}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(interview.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer"
                onClick={() => router.push(`/summary/${interview.id}`)}
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center mt-8 gap-4">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PastInterviewPage;
