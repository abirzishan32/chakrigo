"use server";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { isAdmin } from "./auth.action";
import {dateTimestampInSeconds} from "@sentry/core";
import type { Interview, ModeratorApplication } from "@/types";

interface CreateCustomInterviewParams {
    role: string;
    companyName: string;
    type: string;
    techstack: string[];
    experienceLevel: string;
    questions: string[];
    adminId: string;
    adminName: string;
    isPublic: boolean;
}

export async function createCustomInterview(params: CreateCustomInterviewParams) {
    const {
        role,
        companyName,
        type,
        techstack,
        experienceLevel,
        questions,
        adminId,
        adminName,
        isPublic
    } = params;

    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
        return {
            success: false,
            message: "Unauthorized: Only admins can create custom interviews"
        };
    }

    try {
        // Create the interview document
        const interview = {
            role,
            companyName,
            type,
            techstack,
            level: experienceLevel,
            questions,
            userId: adminId,
            creatorName: adminName,
            isCompanyInterview: true,
            isPublic,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("interviews").add(interview);

        return {
            success: true,
            message: "Interview created successfully",
            interviewId: docRef.id
        };
    } catch (error) {
        console.error("Error creating custom interview:", error);
        return {
            success: false,
            message: "Failed to create interview"
        };
    }
}

export async function getAdminInterviews(adminId: string) {
    try {
        const interviews = await db
            .collection("interviews")
            .where("userId", "==", adminId)
            .where("isCompanyInterview", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        return {
            success: true,
            interviews: interviews.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        };
    } catch (error) {
        console.error("Error fetching admin interviews:", error);
        return {
            success: false,
            interviews: []
        };
    }
}

export async function getAllUsers() {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can view all users",
                users: []
            };
        }

        // Fetch all users from the database
        const usersSnapshot = await db
            .collection("users")
            .orderBy("name", "asc")
            .get();


        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unknown',
                email: data.email || 'No email',
                role: data.role || 'user',
                lastActive: data.lastActive?.toDate?.()?.toISOString() || null,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null
            };
        });

        return {
            success: true,
            users
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            message: "Failed to fetch users",
            users: []
        };
    }
}


export async function getAllInterviews() {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can access this data",
                interviews: []
            };
        }

        // Get all interviews from the database with usage statistics
        const interviewsSnapshot = await db
            .collection("interviews")
            .orderBy("createdAt", "desc")
            .get();

        // Get usage statistics for each interview
        const interviewPromises = interviewsSnapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Count how many times this interview was taken (number of feedbacks)
            const feedbacksSnapshot = await db
                .collection("feedbacks")
                .where("interviewId", "==", doc.id)
                .count()
                .get();

            return {
                id: doc.id,
                ...data,
                usageCount: feedbacksSnapshot.data().count || 0,
                questions: data.questions || [],
                role: data.role,
                level: data.level,
                techstack: data.techstack,
                userId: data.userId,
                type: data.type,
                finalized: data.finalized,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });

        const interviews = await Promise.all(interviewPromises);

        return {
            success: true,
            interviews
        };
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        return {
            success: false,
            message: "Failed to fetch interviews",
            interviews: []
        };
    }
}

export async function deleteInterview(interviewId: string) {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can delete interviews"
            };
        }

        // Delete the interview
        await db.collection("interviews").doc(interviewId).delete();

        // Delete associated feedbacks
        const feedbacksSnapshot = await db
            .collection("feedbacks")
            .where("interviewId", "==", interviewId)
            .get();

        // Use batch delete for feedbacks
        const batch = db.batch();
        feedbacksSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return {
            success: true,
            message: "Interview and related data deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting interview:", error);
        return {
            success: false,
            message: "Failed to delete interview"
        };
    }
}

export async function updateInterviewQuestions(interviewId: string, questions: string[]) {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can update interviews"
            };
        }

        // Update the interview document with new questions
        await db.collection("interviews").doc(interviewId).update({
            questions: questions,
            updatedAt: dateTimestampInSeconds()
        });

        return {
            success: true,
            message: "Interview questions updated successfully"
        };
    } catch (error) {
        console.error("Error updating interview questions:", error);
        return {
            success: false,
            message: "Failed to update interview questions"
        };
    }
}

export async function getInterviewById(interviewId: string) {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can access this data",
                interview: null
            };
        }

        // Fetch the interview
        const interviewDoc = await db.collection("interviews").doc(interviewId).get();

        if (!interviewDoc.exists) {
            return {
                success: false,
                message: "Interview not found",
                interview: null
            };
        }

        const data = interviewDoc.data();

        // Count how many times this interview was taken
        const feedbacksSnapshot = await db
            .collection("feedbacks")
            .where("interviewId", "==", interviewId)
            .count()
            .get();

        return {
            success: true,
            interview: {
                id: interviewDoc.id,
                role: data?.role || "",
                level: data?.level || "",
                questions: data?.questions || [],
                techstack: data?.techstack || [],
                createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                userId: data?.userId || "",
                type: data?.type || "",
                finalized: data?.finalized || false
            } as Interview
        };
    } catch (error) {
        console.error("Error fetching interview:", error);
        return {
            success: false,
            message: "Failed to fetch interview",
            interview: null
        };
    }
}



export async function updateInterview(params: {
    interviewId: string;
    role?: string;
    level?: string;
    questions?: string[];
    techstack?: string[];
    type?: string;
    finalized?: boolean;
}) {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can update interviews"
            };
        }

        const { interviewId, ...updateData } = params;



        // Update the interview
        await db.collection("interviews").doc(interviewId).update(updateData);

        return {
            success: true,
            message: "Interview updated successfully"
        };
    } catch (error) {
        console.error("Error updating interview:", error);
        return {
            success: false,
            message: "Failed to update interview"
        };
    }
}

// Get all moderator applications
export async function getModeratorApplications(): Promise<{
  success: boolean;
  message?: string;
  applications: ModeratorApplication[];
}> {
  try {
    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return {
        success: false,
        message: "Unauthorized: Only admins can view applications",
        applications: [] as ModeratorApplication[]
      };
    }

    // Fetch only pending applications, newest first
    const applicationsSnapshot = await db
      .collection("moderatorApplications")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();

    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ModeratorApplication[];

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error("Error fetching moderator applications:", error);
    return {
      success: false,
      message: "Failed to fetch applications",
      applications: [] as ModeratorApplication[]
    };
  }
}

// Approve or reject moderator application
export async function updateModeratorApplication(params: {
  applicationId: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}) {
  const { applicationId, status, rejectionReason } = params;

  try {
    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return {
        success: false,
        message: "Unauthorized: Only admins can update applications"
      };
    }

    // Get the application
    const applicationDoc = await db
      .collection("moderatorApplications")
      .doc(applicationId)
      .get();

    if (!applicationDoc.exists) {
      return {
        success: false,
        message: "Application not found"
      };
    }

    const application = applicationDoc.data();
    
    if (!application) {
      return {
        success: false,
        message: "Application data is missing"
      };
    }

    // Update application status
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Add rejection reason if provided and status is rejected
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await db
      .collection("moderatorApplications")
      .doc(applicationId)
      .update(updateData);

    // If approved, update user role and company information
    if (status === 'approved') {
      await db.collection("users").doc(application.userId).update({
        role: 'interview-moderator',
        company: application.company,
        companyWebsite: application.companyWebsite,
        position: application.position
      });
    }



    return {
      success: true,
      message: `Application ${status} successfully`
    };
  } catch (error) {
    console.error("Error updating moderator application:", error);
    return {
      success: false,
      message: "Failed to update application"
    };
  }
}