export const ResumeAnalysisSchema = {
    type: "object",
    description: "Comprehensive resume analysis",
    properties: {
        overallScore: { type: "number", minimum: 0, maximum: 100 },
        summary: {
            type: "string",
            description: "High-level summary of the resume",
        },
        parsedContent: {
            type: "object",
            description: "Extracted content from the resume",
            properties: {
                contactInfo: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" },
                        location: { type: "string" },
                        links: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    label: { type: "string" },
                                    url: { type: "string" },
                                },
                                //required: ["type", "url"],
                            },
                        },
                    },
                },
                professionalSummary: { type: "string" },
                workExperience: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            jobTitle: { type: "string" },
                            company: { type: "string" },
                            duration: { type: "string" },
                            responsibilities: {
                                type: "array",
                                items: { type: "string" },
                            },
                            achievements: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                    },
                },
                education: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            degree: { type: "string" },
                            institution: { type: "string" },
                            year: { type: "string" },
                        },
                    },
                },
                skills: {
                    type: "object",
                    properties: {
                        technical: {
                            type: "array",
                            items: { type: "string" },
                        },
                        soft: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                },
                certifications: {
                    type: "array",
                    items: { type: "string" },
                },
                languages: { type: "array", items: { type: "string" } },
                achievements: {
                    type: "array",
                    items: { type: "string" },
                },
                projects: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                            technologies: {
                                type: "array",
                                items: { type: "string" },
                            },
                            link: { type: "string" },
                            duration: { type: "string" },
                        },
                    },
                },
            },
        },
        sections: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    sectionName: { type: "string" },
                    score: { type: "number", minimum: 0, maximum: 100 },
                    issues: { type: "array", items: { type: "string" } },
                    recommendations: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                required: ["sectionName", "score", "issues", "recommendations"],
            },
        },
        jobFitAnalysis: {
            type: "object",
            properties: {
                matchScore: { type: "number", minimum: 0, maximum: 100 },
                missingKeywords: {
                    type: "array",
                    items: { type: "string" },
                },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
            },
        },
    },
    required: [
        "overallScore",
        "summary",
        "parsedContent",
        "sections",
        "jobFitAnalysis",
    ],
    additionalProperties: false,
};
