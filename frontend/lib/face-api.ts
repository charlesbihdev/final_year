import type { ApiResponse } from "@/types";

// This will be used only for FastAPI calls for face recognition and training
class FastApiClient {
  private baseUrl: string = process.env.NEXT_PUBLIC_FAST_API_URL || "http://localhost:8000";

  constructor() {
    console.log("FastAPI Client initialized with URL:", this.baseUrl);
  }

  async uploadFace<T>(
    studentId: number,
    imageData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/train`, {
        method: "POST",
        body: imageData,
      });

      // Check if response is HTML (likely error page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return {
          success: false,
          error: `FastAPI server not accessible at ${this.baseUrl}. Please ensure the FastAPI server is running.`,
        };
      }

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data as T,
          message: data.message || "Face training completed successfully",
        };
      } else {
        // Handle different HTTP error codes
        let errorMessage = "Failed to upload face data";
        
        if (response.status === 404) {
          errorMessage = "Student not found in database";
        } else if (response.status === 400) {
          errorMessage = data.detail || "No valid faces detected in the photo";
        } else if (response.status === 500) {
          errorMessage = data.detail || "Server error during face training";
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error("Face training network error:", error);
      if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        return {
          success: false,
          error: `Cannot connect to FastAPI server at ${this.baseUrl}. Please check if the server is running and accessible.`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network connection failed",
      };
    }
  }

  async recognizeFace<T>(
    sessionId: number,
    imageData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      // Add session_id to FormData
      imageData.append("session_id", sessionId.toString());
      
      const response = await fetch(`${this.baseUrl}/recognize`, {
        method: "POST",
        body: imageData,
      });

      // Check if response is HTML (likely error page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return {
          success: false,
          error: `FastAPI server not accessible at ${this.baseUrl}. Please ensure the FastAPI server is running.`,
        };
      }

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok
          ? undefined
          : data.detail || data.message || "Face recognition failed",
      };
    } catch (error) {
      console.error("FastAPI connection error:", error);
      if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        return {
          success: false,
          error: `Cannot connect to FastAPI server at ${this.baseUrl}. Please check if the server is running and accessible.`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

export const fastApi = new FastApiClient();
