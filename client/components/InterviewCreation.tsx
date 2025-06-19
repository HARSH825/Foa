'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FormDataType , InterviewData, InterviewCreationFormProps } from '@/types/form';
import { InterviewCard } from './InterviewCard';

const InterviewCreationForm: React.FC<InterviewCreationFormProps> = ({ 
  onSuccess, 
  onError 
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

      const res = await fetch('http://localhost:4000/api/v1/interview/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const result = await res.json();
      const interviewId = result.interviewId;

      if (res.ok) {
        toast.success(result.message);
        
        // Create interview data object for the card
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
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Interview Created Successfully! </h2>
          <p className="text-gray-400">Your interview is ready. Start it now.</p>
        </div>
        
        <InterviewCard 
          interview={createdInterview} 
          onStartInterview={handleStartInterview}
        />
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleCreateAnother}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
          >
            Create Another Interview
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Interview</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Interview Type *
          </label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="text-gray-400">Select interview type</option>
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral</option>
            <option value="System Design">System Design</option>
            <option value="General">General</option>
            <option value="HR">HR Round</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Position *
          </label>
          <input 
            name="position" 
            value={formData.position} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="e.g. Software Engineer" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Experience Level *
          </label>
          <select 
            name="experience" 
            value={formData.experience} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="text-gray-400">Select level</option>
            <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
            <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
            <option value="Senior Level (6-10 years)">Senior Level (6-10 years)</option>
            <option value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Specialization *
          </label>
          <input 
            name="specialization" 
            value={formData.specialization} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="e.g. Frontend, Backend, Full Stack" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Company *
          </label>
          <input 
            name="company" 
            value={formData.company} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="e.g. Google, Microsoft, Amazon" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Interview Style *
          </label>
          <select 
            name="style" 
            value={formData.style} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="text-gray-400">Select style</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="challenging">Challenging</option>
            <option value="leetcode">LeetCode Style</option>
            <option value="system-design">System Design Focus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Duration *
          </label>
          <select 
            name="duration" 
            value={formData.duration} 
            onChange={handleInputChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="text-gray-400">Select duration</option>
            <option value="15 minutes">15 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="45 minutes">45 minutes</option>
            <option value="60 minutes">60 minutes</option>
            <option value="90 minutes">90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">
            Upload Resume (PDF) *
          </label>
          <input 
            type="file" 
            id="resume-upload" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer" 
          />
          {formData.resume && (
            <p className="text-sm text-gray-400 mt-1">
              Selected: {formData.resume.name}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isLoading ? 'Creating Interview...' : 'Create Interview'}
        </button>
      </div>
    </div>
  );
};

export default InterviewCreationForm;