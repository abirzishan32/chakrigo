import { notFound } from "next/navigation";
import { getCareerExperienceById } from "@/lib/actions/career-experience.action";
import ExperienceDetail from "@/components/career/ExperienceDetail";

interface CareerDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CareerDetailPageProps) {
  const { id } = params;
  const result = await getCareerExperienceById(id);
  
  if (!result.success || !result.data) {
    return {
      title: "Experience Not Found | ChakriGO",
      description: "The interview experience you're looking for could not be found."
    };
  }
  
  const experience = result.data;
  
  return {
    title: `${experience.companyName} - ${experience.position} Interview Experience | ChakriGO`,
    description: `Anonymous interview experience for ${experience.position} position at ${experience.companyName}. Read about the interview process and questions.`
  };
}

export default async function CareerDetailPage({ params }: CareerDetailPageProps) {
  const { id } = params;
  const result = await getCareerExperienceById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const experience = result.data;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ExperienceDetail experience={experience} />
    </div>
  );
} 