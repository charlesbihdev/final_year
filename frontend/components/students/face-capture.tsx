"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload } from "lucide-react";
import { fastApi } from "@/lib/face-api";
import type { Student } from "@/types";

interface FaceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export function FaceCapture({
  isOpen,
  onClose,
  student,
  onSuccess,
}: FaceCaptureProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleTraining = async () => {
    if (!selectedFile || !student) return;

    setIsTraining(true);
    setResult(null);

    try {
      const formData = new FormData();
      // The API expects 'photos' as a list of files and 'student_id' as form data
      formData.append("photos", selectedFile);
      formData.append("student_id", student.id.toString());

      const response = await fastApi.uploadFace(student.id, formData);

      if (response.success) {
        const successMessage = response.message || "Face data registered successfully!";
        setResult(successMessage);
        setTimeout(() => {
          onSuccess();
        }, 2500);
      } else {
        // Display specific error messages from the API
        const errorMessage = response.error || "Failed to register face data";
        setResult(errorMessage);
      }
    } catch (error) {
      console.error("Error training face:", error);
      setResult("Network error: Could not connect to face training service");
    } finally {
      setIsTraining(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Face Registration"
      description={`Register face data for ${student?.name || "student"}`}
      size="lg"
    >
      <div className="space-y-4">
        {student && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-600">{student.index_number}</div>
            <div className="text-sm text-gray-600">
              {student.department} - Level {student.level}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="face-photo">Capture or Upload Photo</Label>
          <Input
            ref={fileInputRef}
            id="face-photo"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Please ensure the photo shows a clear view of the face
          </p>
        </div>

        {preview && (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Face preview"
                className="w-full max-w-md mx-auto h-64 object-cover rounded-lg border"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTraining}
                disabled={isTraining}
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                {isTraining ? "Registering..." : "Register Face"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        )}

        {isTraining && (
          <div className="space-y-2">
            <div className="text-center text-sm text-gray-600">
              Processing face data...
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {result && (
          <Alert
            className={`${
              result.includes("successfully") || result.includes("Successfully")
                ? "border-green-200 bg-green-50"
                : result.includes("not found") || result.includes("Network error")
                ? "border-red-200 bg-red-50"
                : result.includes("No valid faces")
                ? "border-yellow-200 bg-yellow-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription
              className={
                result.includes("successfully") || result.includes("Successfully")
                  ? "text-green-800"
                  : result.includes("not found") || result.includes("Network error")
                  ? "text-red-800"
                  : result.includes("No valid faces")
                  ? "text-yellow-800"
                  : "text-red-800"
              }
            >
              {result}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
