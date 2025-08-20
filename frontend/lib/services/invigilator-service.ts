import { api } from "../api";
import type { ExamSession } from "@/types";

export const invigilatorService = {
  async getAssignedSessions(userId: number) {
    try {
      const response = await api.get<ExamSession[]>(`/invigilators/${userId}/sessions`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch sessions");
      }

      return {
        success: true,
        data: response.data,
        error: undefined,
      };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return {
        success: false,
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to fetch sessions",
      };
    }
  },

  async getSessionAttendance(sessionId: number) {
    try {
      const response = await api.get<{ present: number; total: number }>(`/sessions/${sessionId}/attendance`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch attendance");
      }

      return {
        success: true,
        data: response.data,
        error: undefined,
      };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return {
        success: false,
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to fetch attendance",
      };
    }
  },
};
