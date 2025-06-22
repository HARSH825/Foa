import { InterviewData } from "@/types/form";

export const InterviewCard: React.FC<{ interview: InterviewData; onStartInterview: () => void }> = ({ 
  interview, 
  onStartInterview 
}) => {
  const getStyleColor = (style: string) => {
    const colors = {
      friendly: 'bg-green-600',
      formal: 'bg-blue-600',
      challenging: 'bg-red-600',
      leetcode: 'bg-purple-600',
      'system-design': 'bg-orange-600'
    };
    return colors[style as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{interview.position}</h3>
            <p className="text-gray-400 text-sm">at {interview.company}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStyleColor(interview.style)}`}>
          {interview.style}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Type</p>
          <p className="text-white font-medium">{interview.type}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
          <p className="text-white font-medium">{interview.duration}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Experience</p>
          <p className="text-white font-medium">{interview.experience}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Specialization</p>
          <p className="text-white font-medium">{interview.specialization}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          Created: {new Date(interview.createdAt).toLocaleDateString()}
        </p>
        <button
          onClick={onStartInterview}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};
