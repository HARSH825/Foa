export interface FormDataType {
  type: string;
  position: string;
  experience: string;
  specialization: string;
  company: string;
  style: string;
  duration: string;
  resume: File | null;
}

export interface InterviewData {
  id: string;
  type: string;
  position: string;
  experience: string;
  specialization: string;
  company: string;
  style: string;
  duration: string;
  createdAt: string;
}

export  interface InterviewCreationFormProps {
  onSuccess?: (interviewId: string) => void;
  onError?: (error: string) => void;
}

export interface Interview {
  id: string;
  type: string;
  position: string;
  company: string;
  experience: string;
  specialization: string;
  style: string;
  duration: string;
  createdAt: string;
  interviewChats: { id: string }[];
}
export type SummaryData = {
  strengths: { point: string; example: string }[];
  weaknesses: { issue: string; advice: string }[];
  recommendations: string[];
};