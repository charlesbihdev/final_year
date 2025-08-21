"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, X } from "lucide-react";
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    // Convert FileList to array and take up to 2 files
    const fileArray = Array.from(files).slice(0, 2);
    
    // Process files sequentially to avoid race conditions
    for (const file of fileArray) {
      newFiles.push(file);
      
      // Create preview synchronously
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      
      newPreviews.push(preview);
    }
    
    // Append new files to existing ones (up to 2 total)
    const totalFiles = [...selectedFiles, ...newFiles].slice(0, 2);
    const totalPreviews = [...previews, ...newPreviews].slice(0, 2);
    
    setSelectedFiles(totalFiles);
    setPreviews(totalPreviews);
    setResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(e.target.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleTraining = async () => {
    if (selectedFiles.length === 0 || !student) return;

    setIsTraining(true);
    setResult(null);

    try {
      const formData = new FormData();
      // Append multiple photos for better accuracy
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });
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
    setSelectedFiles([]);
    setPreviews([]);
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
          <Label htmlFor="face-photo">
            Upload 2 Photos for Better Accuracy 
            {selectedFiles.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({selectedFiles.length}/2)
              </span>
            )}
          </Label>
          <Input
            ref={fileInputRef}
            id="face-photo"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="mt-1"
            disabled={selectedFiles.length >= 2}
          />
          <p className="text-sm text-gray-500 mt-1">
            {selectedFiles.length >= 2 
              ? "Maximum 2 photos reached. Remove a photo to add more."
              : "Upload 2 different photos showing clear views of the face from different angles"
            }
          </p>
        </div>

        {previews.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Face preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="text-xs text-center mt-1 text-gray-500">
                    Photo {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTraining}
                disabled={isTraining || selectedFiles.length === 0}
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                {isTraining ? "Registering..." : `Register Face (${selectedFiles.length} photos)`}
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
              Processing {selectedFiles.length} face images...
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
