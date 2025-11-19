import { MyTask } from "./common";

export interface ModerationQueueItem extends MyTask {
    batchName: string;
    violationCount: number;
    violations: ViolationDetail[];
}

export interface VerifyViolationPayload {
    submissionId: string;
    isViolationConfirmed: boolean;
    moderatorComment: string;
}

export interface VerifyViolationResponse {
    message: string;
}

export interface ViolationDetail {
    id: string,
    violationType: string,
    details: string,
    similarityScore: null | number
}