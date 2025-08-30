"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCareerExperience, InterviewExperience, InterviewSource } from "@/lib/actions/career-experience.action";

type FormValues = {
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
  question: string;
};

interface ExperienceFormProps {
  userId: string;
}

export default function ExperienceForm({ userId }: ExperienceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      companyName: '',
      position: '',
      experience: 'neutral',
      source: 'Applied online',
      details: '',
      question: ''
    }
  });

  const addQuestion = () => {
    if (questionInput.trim() === '') return;
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
    setValue('question', '');
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const result = await createCareerExperience({
        userId,
        companyName: data.companyName,
        position: data.position,
        experience: data.experience,
        source: data.source,
        details: data.details,
        questions: questions,
      });

      if (result.success) {
        toast.success("Your experience has been shared!");
        reset();
        setQuestions([]);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to share your experience.");
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-6">Share Your Interview Experience</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company Name*</label>
            <input
              {...register("companyName", { required: "Company name is required" })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. TigerIT Bangladesh"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Position Applied For*</label>
            <input
              {...register("position", { required: "Position is required" })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Full Stack Developer"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Interview Experience*</label>
            <select
              {...register("experience", { required: "Experience rating is required" })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            {errors.experience && (
              <p className="mt-1 text-sm text-red-500">{errors.experience.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">How Did You Get The Interview?*</label>
            <select
              {...register("source", { required: "Interview source is required" })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Applied online">Applied online</option>
              <option value="Campus Recruiting">Campus Recruiting</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Employee Referral">Employee Referral</option>
              <option value="In Person">In Person</option>
              <option value="Staffing Agency">Staffing Agency</option>
              <option value="Other">Other</option>
            </select>
            {errors.source && (
              <p className="mt-1 text-sm text-red-500">{errors.source.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Experience Details*</label>
          <textarea
            {...register("details", { 
              required: "Experience details are required",
              minLength: { value: 50, message: "Please provide at least 50 characters" }
            })}
            rows={5}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your interview experience in detail. What was the process like? What did you like or dislike? Any advice for others?"
          ></textarea>
          {errors.details && (
            <p className="mt-1 text-sm text-red-500">{errors.details.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Interview Questions</label>
          <div className="flex items-center gap-2">
            <input
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add questions you were asked"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
            />
            <button
              title="Add Question"
              type="button"
              onClick={addQuestion}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {questions.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-300">Added Questions:</p>
              <ul className="space-y-2">
                {questions.map((q, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-800 rounded-md p-2 pl-3 border border-gray-700">
                    <span className="text-gray-300">{q}</span>
                    <button
                      title="Remove Question"
                      type="button" 
                      onClick={() => removeQuestion(index)} 
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Experience"
            )}
          </button>
          <p className="mt-2 text-xs text-gray-400">
            Your submission will be posted anonymously. Other users won't see your personal information.
          </p>
        </div>
      </form>
    </div>
  );
} 