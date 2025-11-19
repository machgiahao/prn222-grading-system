import { MyTask } from "./common";

export interface ModerationQueueItem extends MyTask {
    violationCount: number;
}

export interface VerifyViolationPayload {
    submissionId: string;
    isViolationConfirmed: boolean;
    moderatorComment: string;
}

export interface VerifyViolationResponse {
    message: string;
}