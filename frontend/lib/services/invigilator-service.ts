import { api } from "../api";
import type { ExamSession } from "@/types";

export const invigilatorService = {
  async getAssignedSessions(userId: number) {
    try {
      const response = await fetch(`/api/invigilators/${userId}/sessions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      return {
        success: true,
        data: data.data,
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
      const response = await fetch(`/api/sessions/${sessionId}/attendance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch attendance");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch attendance");
      }

      return {
        success: true,
        data: data.data,
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
