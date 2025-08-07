import { getInterviewById, canAccessModeratorInterview, hasUserCompletedInterview } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import VoiceAgent from "@/components/VoiceAgent";
import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";

const Page = async ({ params }: RouteParams) => {
    // Check authentication first
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) redirect('/sign-up');

    const { id } = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if (!interview) redirect('/interview-home');

    // Check if this is a moderator interview and if the user has access
    if (interview.isModeratorInterview) {
        const hasAccess = await canAccessModeratorInterview(id, user?.id!);
        if (!hasAccess) {
            redirect('/interview-home?error=no-access');
        }
    }

    // Check if this is a company interview and if the user has already completed it
    if ((interview.isCompanyInterview || interview.isModeratorInterview) && user?.id) {
        const hasCompleted = await hasUserCompletedInterview(id, user.id);
        if (hasCompleted) {
            redirect(`/interview-main/${id}/feedback?completed=true`);
        }
    }

    return (
        <div className="min-h-screen">
            {/* Header with interview info - embedded in VoiceAgent component now */}
            <VoiceAgent
                userName={user?.name || ''}
                userId={user?.id}
                interviewId={id}
                type="interview"
                questions={interview.questions}
                saveResult={interview.isCompanyInterview || interview.isModeratorInterview}
            />
        </div>
    );
};

export default Page;