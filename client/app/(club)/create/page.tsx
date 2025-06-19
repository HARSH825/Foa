'use client'
import React from 'react';
import InterviewCreationForm from '@/components/InterviewCreation';

const InterviewPage: React.FC = () => {
  const handleSuccess = () => {
    console.log('Interview created successfully!');
  };

  const handleError = (error: string) => {
    console.error('Error creating interview:', error);
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <InterviewCreationForm 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default InterviewPage;