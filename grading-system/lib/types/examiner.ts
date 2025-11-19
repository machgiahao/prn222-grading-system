import * as z from "zod";

export interface RubricItem {
    id: string;
    criteria: string;
    maxScore: number;
}

export interface GradingDetails {
    submissionId: string;
    studentCode: string;
    originalFileName: string;
    status: string;
    rubricItems: RubricItem[];
}

export interface GradeResponse {
    message: string;
}


export const GradedItemSchema = z.object({
    rubricItemId: z.string().uuid(),
    score: z.number({
        required_error: "Điểm không được để trống",
        invalid_type_error: "Điểm phải là số"
    }).min(0, "Điểm phải là số dương hoặc 0."),
});

export const GradePayloadSchema = z.object({
    submissionId: z.string().uuid(),
    comment: z.string().max(500).optional().default(""),
    gradedItems: z.array(GradedItemSchema),
});

export type GradedItem = z.infer<typeof GradedItemSchema>;
export type GradePayload = z.infer<typeof GradePayloadSchema>;