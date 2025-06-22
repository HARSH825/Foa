'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FormDataType, InterviewData, InterviewCreationFormProps } from '@/types/form';
import { InterviewCard } from './InterviewCard';
import { Card } from '@/components/ui/card';
import { BE_URL } from '@/config';
const InterviewCreationForm: React.FC<InterviewCreationFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { userData } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdInterview, setCreatedInterview] = useState<InterviewData | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    type: '',
    position: '',
    experience: '',
    specialization: '',
    company: '',
    style: '',
    duration: '',
    resume: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
    } else {
      const errorMsg = 'Please select a valid PDF file';
      toast.error(errorMsg);
      onError?.(errorMsg);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      position: '',
      experience: '',
      specialization: '',
      company: '',
      style: '',
      duration: '',
      resume: null,
    });

    const input = document.getElementById('resume-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const handleStartInterview = () => {
    if (createdInterview) {
      router.push(`/start/${createdInterview.id}`);
    }
  };

  const handleCreateAnother = () => {
    setCreatedInterview(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!userData) {
      const errorMsg = 'Please login to create an interview';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const requiredFields: (keyof FormDataType)[] = [
      'type',
      'position',
      'experience',
      'specialization',
      'company',
      'style',
      'duration',
    ];
    const missing = requiredFields.filter((f) => !formData[f]);

    if (missing.length > 0) {
      const errorMsg = `Please fill in all fields: ${missing.join(', ')}`;
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!formData.resume) {
      const errorMsg = 'Resume is required';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const errorMsg = 'Unauthorized';
        toast.error(errorMsg);
        onError?.(errorMsg);
        router.push('/');
        return;
      }

      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });

      const res = await fetch(`${BE_URL}/api/v1/interview/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const result = await res.json();
      const interviewId = result.interviewId;

      if (res.ok) {
        toast.success(result.message);
        const interviewData: InterviewData = {
          id: interviewId,
          type: formData.type,
          position: formData.position,
          experience: formData.experience,
          specialization: formData.specialization,
          company: formData.company,
          style: formData.style,
          duration: formData.duration,
          createdAt: new Date().toISOString(),
        };
        setCreatedInterview(interviewData);
        onSuccess?.(interviewId);
      } else {
        const errorMsg = result.message || 'Failed to create interview';
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = 'Something went wrong. Please try again.';
      toast.error(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (createdInterview) {
    return (
      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Interview Created Successfully!
          </h2>
          <p className="text-muted-foreground">Your interview is ready. Start it now.</p>
        </div>
        <InterviewCard interview={createdInterview} onStartInterview={handleStartInterview} />
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleCreateAnother}
            className="flex-1 bg-muted text-foreground border border-border py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:bg-muted/80"
          >
            Create Another Interview
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Create New Interview</h2>

      {[
        {
          label: 'Interview Type',
          name: 'type',
          type: 'select',
          options: ['Technical', 'Behavioral', 'System Design', 'General', 'HR'],
        },
        {
          label: 'Position',
          name: 'position',
          type: 'input',
          placeholder: 'e.g. Software Engineer',
        },
        {
          label: 'Experience Level',
          name: 'experience',
          type: 'select',
          options: [
            'Entry Level (0-2 years)',
            'Mid Level (3-5 years)',
            'Senior Level (6-10 years)',
            'Lead/Principal (10+ years)',
          ],
        },
        {
          label: 'Specialization',
          name: 'specialization',
          type: 'input',
          placeholder: 'e.g. Frontend, Backend, Full Stack',
        },
        {
          label: 'Company',
          name: 'company',
          type: 'input',
          placeholder: 'e.g. Google, Microsoft, Amazon',
        },
        {
          label: 'Interview Style',
          name: 'style',
          type: 'select',
          options: ['friendly', 'formal', 'challenging', 'leetcode', 'system-design'],
        },
        {
          label: 'Duration',
          name: 'duration',
          type: 'select',
          options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes'],
        },
      ].map(({ label, name, type, options, placeholder }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {label} *
          </label>
          {type === 'input' ? (
            <input
              name={name}
              value={formData[name as keyof FormDataType] as string}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          ) : (
            <select
              name={name}
              value={formData[name as keyof FormDataType] as string}
              onChange={handleInputChange}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="" className="text-muted-foreground">
                Select {label.toLowerCase()}
              </option>
              {options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Upload Resume (PDF) *
        </label>
        <input
          type="file"
          id="resume-upload"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-3 bg-background border border-border rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-black hover:file:bg-primary/90 file:cursor-pointer"
        />
        {formData.resume && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {formData.resume.name}
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
      >
        {isLoading ? 'Creating Interview...' : 'Create Interview'}
      </button>
    </Card>
  );
};

export default InterviewCreationForm;
