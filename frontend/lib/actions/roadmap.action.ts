"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

interface SavedRoadmap {
  id: string;
  title: string;
  careerPath: string;
  analysis: any;
  roadmapStructure: {
    nodes: any[];
    edges: any[];
    phases: any[];
  };
  detailedDescription: string;
  metadata: any;
  createdAt: number;
  updatedAt: number;
}

export async function saveRoadmap(roadmapData: {
  title: string;
  careerPath: string;
  analysis: any;
  roadmapStructure: any;
  detailedDescription: string;
  metadata: any;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const timestamp = Date.now();
    const roadmapDoc = {
      title: roadmapData.title,
      careerPath: roadmapData.careerPath,
      analysis: roadmapData.analysis,
      roadmapStructure: roadmapData.roadmapStructure,
      detailedDescription: roadmapData.detailedDescription,
      metadata: roadmapData.metadata,
      userId: user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("roadmaps").add(roadmapDoc);

    return {
      success: true,
      message: "Roadmap saved successfully!",
      roadmapId: docRef.id,
    };
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return {
      success: false,
      message: "Failed to save roadmap. Please try again.",
    };
  }
}

export async function getUserRoadmaps() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated", roadmaps: [] };
    }

    const roadmapsRef = db.collection("roadmaps");
    const query = roadmapsRef
      .where("userId", "==", user.id)
      .orderBy("updatedAt", "desc");

    const snapshot = await query.get();
    const roadmaps: SavedRoadmap[] = [];

    snapshot.forEach((doc) => {
      roadmaps.push({
        id: doc.id,
        ...doc.data(),
      } as SavedRoadmap);
    });

    return {
      success: true,
      roadmaps,
    };
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    return {
      success: false,
      message: "Failed to fetch roadmaps",
      roadmaps: [],
    };
  }
}

export async function getRoadmapById(roadmapId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const roadmapDoc = await db.collection("roadmaps").doc(roadmapId).get();

    if (!roadmapDoc.exists) {
      return { success: false, message: "Roadmap not found" };
    }

    const roadmapData = roadmapDoc.data();

    // Check if the roadmap belongs to the current user
    if (roadmapData?.userId !== user.id) {
      return { success: false, message: "Unauthorized access" };
    }

    return {
      success: true,
      roadmap: {
        id: roadmapDoc.id,
        ...roadmapData,
      } as SavedRoadmap,
    };
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return {
      success: false,
      message: "Failed to fetch roadmap",
    };
  }
}

export async function deleteRoadmap(roadmapId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const roadmapDoc = await db.collection("roadmaps").doc(roadmapId).get();

    if (!roadmapDoc.exists) {
      return { success: false, message: "Roadmap not found" };
    }

    const roadmapData = roadmapDoc.data();

    // Check if the roadmap belongs to the current user
    if (roadmapData?.userId !== user.id) {
      return { success: false, message: "Unauthorized access" };
    }

    await db.collection("roadmaps").doc(roadmapId).delete();

    return {
      success: true,
      message: "Roadmap deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return {
      success: false,
      message: "Failed to delete roadmap",
    };
  }
}