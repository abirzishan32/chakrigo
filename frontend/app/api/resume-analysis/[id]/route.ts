import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";

// GET endpoint - fetch specific resume analysis by ID
export async function GET(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        // Fetch the specific analysis
        const analysis = await db
            .collection("resume_analyses")
            .doc(id)
            .get();

        if (!analysis.exists) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        // Verify the analysis belongs to the current user
        if (analysis.data().userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this analysis" },
                { status: 403 }
            );
        }

        return NextResponse.json({ data: analysis.data() }, { status: 200 });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        return NextResponse.json(
            { error: "Failed to fetch analysis" },
            { status: 500 }
        );
    }
}
