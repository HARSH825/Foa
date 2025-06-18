'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Interview } from '@/types/form';

const PastInterviewPage = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/v1/interview/pastInterview', {
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

  if (loading) {
    return (
      <div className="text-center py-10 text-foreground">Loading...</div>
    );
  }

  if (!interviews.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">No past interviews found. Past Interviews are shown if communication was initialised.</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Past Interviews</h2>
      
      <div className="space-y-4">
        {interviews.map((interview) => (
          <div key={interview.id} className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-primary">{interview.position} @ {interview.company}</h3>
                <p className="text-sm text-muted-foreground">{interview.type} | {interview.experience} | {interview.specialization}</p>
                <p className="text-sm text-muted-foreground">Style: {interview.style} | Duration: {interview.duration}</p>
                <p className="text-xs text-gray-500">Created: {new Date(interview.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                onClick={() => router.push(`/review/${interview.id}`)} 
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastInterviewPage;
