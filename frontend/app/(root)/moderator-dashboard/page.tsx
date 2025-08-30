import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getModeratorInterviews, getModeratorFeedbacks } from '@/lib/actions/general.action';
import Link from 'next/link';

const ModeratorDashboardPage = async () => {
  // Get current user and verify they are a moderator
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'interview-moderator') {
    redirect('/interview-home');
  }

  // Get interviews created by this moderator
  const interviews = await getModeratorInterviews(user.id);
  const feedbacks = await getModeratorFeedbacks(user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          {user.company} Moderator Dashboard
        </h1>
        <Link 
          href="/moderator-dashboard/create-interview"
          className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-md"
        >
          Create New Interview
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Interviews</h3>
          <p className="text-3xl font-bold text-primary-100">{interviews.length}</p>
          <p className="text-gray-400 mt-2">Total interviews created</p>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Participants</h3>
          <p className="text-3xl font-bold text-primary-100">{feedbacks.length}</p>
          <p className="text-gray-400 mt-2">Total interview completions</p>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Avg. Score</h3>
          <p className="text-3xl font-bold text-primary-100">
            {feedbacks.length > 0 
              ? Math.round(feedbacks.reduce((sum, feedback) => sum + feedback.totalScore, 0) / feedbacks.length) 
              : '---'}
          </p>
          <p className="text-gray-400 mt-2">Average candidate score</p>
        </div>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-lg mb-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Your Interviews</h2>
        </div>
        
        {interviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Participants</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date Created</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {interviews.map((interview) => {
                  const interviewFeedbacks = feedbacks.filter(f => f.interviewId === interview.id);
                  const participantCount = interviewFeedbacks.length;
                  
                  return (
                    <tr key={interview.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 text-sm text-white">
                        {interview.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {interview.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {interview.level}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {participantCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 space-x-2">
                        <Link 
                          href={`/moderator-dashboard/interview/${interview.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Results
                        </Link>
                        <Link 
                          href={`/moderator-dashboard/manage-emails/${interview.id}`}
                          className="text-green-400 hover:text-green-300 ml-4"
                        >
                          Manage Access
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>You haven't created any interviews yet.</p>
            <p className="mt-2">
              <Link href="/moderator-dashboard/create-interview" className="text-primary-100 hover:underline">
                Create your first interview
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboardPage; 