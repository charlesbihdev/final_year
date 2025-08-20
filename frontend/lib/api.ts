import type { ApiResponse } from "@/types";

class ApiClient {
  private baseUrl: string;

  constructor() {
    // For Next.js API routes, we need the /api prefix
    this.baseUrl = "/api";
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || data.message || "Request failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || data.message || "Request failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || data.message || "Request failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || data.message || "Request failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || data.message || "Request failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

export const api = new ApiClient();
