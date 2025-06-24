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
  const [jdInputType, setJdInputType] = useState<'file' | 'text' | 'none'>('none');
  const [formData, setFormData] = useState<FormDataType>({
    type: '',
    position: '',
    experience: '',
    specialization: '',
    company: '',
    style: '',
    duration: '',
    resume: null,
    jd: null,
    jdText: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldName = e.target.name as 'resume' | 'jd';
    
    if (file && file.type === 'application/pdf') {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    } else {
      const errorMsg = 'Please select a valid PDF file';
      toast.error(errorMsg);
      onError?.(errorMsg);
      e.target.value = '';
    }
  };

  const handleJdInputTypeChange = (type: 'file' | 'text' | 'none') => {
    setJdInputType(type);
    setFormData((prev) => ({
      ...prev,
      jd: null,
      jdText: '',
    }));
    
    const jdFileInput = document.getElementById('jd-upload') as HTMLInputElement | null;
    if (jdFileInput) jdFileInput.value = '';
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
      jd: null,
      jdText: '',
    });
    setJdInputType('none');

    const resumeInput = document.getElementById('resume-upload') as HTMLInputElement | null;
    const jdInput = document.getElementById('jd-upload') as HTMLInputElement | null;
    if (resumeInput) resumeInput.value = '';
    if (jdInput) jdInput.value = '';
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

  if (jdInputType === 'file' && !formData.jd) {
    const errorMsg = 'Please upload a JD file or switch to text input';
    toast.error(errorMsg);
    onError?.(errorMsg);
    return;
  }

  if (jdInputType === 'text' && !formData.jdText.trim()) {
    const errorMsg = 'Please enter JD text or switch to file upload';
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

    // Exclude jdText from loop to avoid double appending
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'resume' && key !== 'jd' && key !== 'jdText' && value) {
        body.append(key, value);
      }
    });

    if (formData.resume) {
      body.append('resume', formData.resume);
    }

    if (jdInputType === 'file' && formData.jd) {
      body.append('jd', formData.jd);
    } else if (jdInputType === 'text' && formData.jdText.trim()) {
      body.append('jdText', formData.jdText.trim()); // ✅ Correctly append here only
    }

    const res = await fetch(`${BE_URL}/api/v1/interview/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    const result = await res.json();
    const { interviewId, hasJD } = result;

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
        hasJD,
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
          <p className="text-muted-foreground">
            Your interview is ready. {createdInterview.hasJD && 'Job description has been included.'} Start it now.
          </p>
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
          options: ['Technical', 'Behavioral', 'System Design','Problem Solving (Leetcode)','General', 'HR'],
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
          options: ['friendly', 'formal', 'challenging'],
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
          name="resume"
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

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Job Description (Optional)
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Adding a job description will help tailor the interview questions to specific requirements.
        </p>
        
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleJdInputTypeChange('none')}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
              jdInputType === 'none'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            Skip JD
          </button>
          <button
            type="button"
            onClick={() => handleJdInputTypeChange('file')}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
              jdInputType === 'file'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => handleJdInputTypeChange('text')}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
              jdInputType === 'text'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            Paste Text
          </button>
        </div>

        {jdInputType === 'file' && (
          <div>
            <input
              type="file"
              id="jd-upload"
              name="jd"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-black hover:file:bg-primary/90 file:cursor-pointer"
            />
            {formData.jd && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {formData.jd.name}
              </p>
            )}
          </div>
        )}

        {jdInputType === 'text' && (
          <div>
            <textarea
              name="jdText"
              value={formData.jdText}
              onChange={handleInputChange}
              placeholder="Paste the job description here..."
              rows={6}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            />
            {formData.jdText && (
              <p className="text-sm text-muted-foreground mt-1">
                {formData.jdText.length} characters
              </p>
            )}
          </div>
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