import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";


// GET endpoint - fetch specific resume analysis by ID
export async function GET(
    request: Request, 
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        // Fixed: Use the correct collection name 'resumeAnalyses'
        const analysis = await db
            .collection("resumeAnalyses") 
            .doc(id)
            .get();

        if (!analysis.exists) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        const analysisData = analysis.data();

        // Verify the analysis belongs to the current user
        if (!analysisData || analysisData.userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this analysis" },
                { status: 403 }
            );
        }

        // Return the data with the document ID included
        return NextResponse.json({ 
            data: {
                id: analysis.id,
                ...analysisData
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        return NextResponse.json(
            { error: "Failed to fetch analysis" },
            { status: 500 }
        );
    }
}
