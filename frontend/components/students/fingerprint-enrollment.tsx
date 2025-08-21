"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, CheckCircle, AlertCircle } from "lucide-react";
import type { Student } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface FingerprintEnrollmentProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export function FingerprintEnrollment({
  isOpen,
  onClose,
  student,
  onSuccess,
}: FingerprintEnrollmentProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const [isClearing, setIsClearing] = useState(false);
  const [fingerprintId, setFingerprintId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "generating" | "waiting" | "completed">("idle");

  const resetState = () => {
    setIsGenerating(false);
    setIsClearing(false);
    setFingerprintId(null);
    setStatus("");
    setResult(null);
    setStep("idle");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const generateFingerprintId = async () => {
    if (!student) return;

    setIsGenerating(true);
    setStep("generating");
    setStatus("Generating unique fingerprint ID...");
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/fingerprint/generate/${student.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (response.ok && data) {
        const { fingerprint_id } = data;
        setFingerprintId(fingerprint_id);
        setStatus(`Fingerprint ID ${fingerprint_id} generated successfully!`);
        setStep("waiting");
        setResult(`Please place your finger on the fingerprint sensor and enroll fingerprint ID: ${fingerprint_id}`);
      } else {
        setResult(data.detail || "Failed to generate fingerprint ID");
        setStep("idle");
      }
    } catch (error) {
      console.error("Error generating fingerprint ID:", error);
      setResult("Network error: Could not connect to fingerprint service");
      setStep("idle");
    } finally {
      setIsGenerating(false);
    }
  };



  const clearFingerprint = async () => {
    if (!student) return;
    
    setIsClearing(true);
    setStatus("Assigning fingerprint to student and clearing temporary data...");

    try {
      const response = await fetch(`${BACKEND_URL}/fingerprint/clear/${student.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus("Fingerprint assigned to student successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setResult(data.detail || "Failed to assign fingerprint to student");
      }
    } catch (error) {
      console.error("Error assigning fingerprint:", error);
      setResult("Network error: Could not assign fingerprint to student");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDone = () => {
    if (step === "completed") {
      clearFingerprint();
    }
  };

  // No automatic polling - user will manually check status

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Fingerprint Enrollment"
      description={`Enroll fingerprint for ${student?.name || "student"}`}
      size="lg"
    >
      <div className="space-y-6">
        {student && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-600">{student.index_number}</div>
            <div className="text-sm text-gray-600">
              {student.department} - Level {student.level}
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${
              step === "idle" ? "bg-gray-100" :
              step === "generating" ? "bg-blue-100" :
                             step === "waiting" ? "bg-yellow-100" :
               "bg-green-100"
            }`}>
              <Fingerprint className={`w-8 h-8 ${
                step === "idle" ? "text-gray-400" :
                step === "generating" ? "text-blue-600" :
                               step === "waiting" ? "text-yellow-600" :
               "text-green-600"
              }`} />
            </div>
          </div>

          {step === "idle" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Start Fingerprint Enrollment</h3>
              <p className="text-gray-600">
                Click the button below to generate a unique fingerprint ID and begin the enrollment process.
              </p>
              <Button
                onClick={generateFingerprintId}
                disabled={isGenerating}
                className="gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate Fingerprint ID"}
              </Button>
            </div>
          )}

          {step === "generating" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generating Fingerprint ID</h3>
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-gray-600">{status}</p>
            </div>
          )}

                     {step === "waiting" && (
             <div className="space-y-4">
               <h3 className="text-lg font-medium">Place Finger on Sensor</h3>
               <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                 <div className="flex items-center gap-2 mb-2">
                   <AlertCircle className="w-5 h-5 text-yellow-600" />
                   <span className="font-medium text-yellow-800">Instructions</span>
                 </div>
                 <ul className="text-sm text-yellow-700 space-y-1">
                   <li>• Place your finger on the fingerprint sensor</li>
                   <li>• Follow the sensor's enrollment instructions</li>
                   <li>• Use fingerprint ID: <strong>{fingerprintId}</strong></li>
                   <li>• Click "Done" when enrollment is complete</li>
                 </ul>
               </div>
               <p className="text-sm text-gray-600">{status}</p>
               <Button
                 onClick={clearFingerprint}
                 disabled={isClearing}
                 className="gap-2"
               >
                 {isClearing ? "Clearing..." : "Done"}
               </Button>
             </div>
           )}

          {step === "completed" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-800">Enrollment Complete!</h3>
              <p className="text-sm text-gray-600">{status}</p>
              <Button
                onClick={handleDone}
                disabled={isClearing}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isClearing ? "Clearing..." : "Done"}
              </Button>
            </div>
          )}
        </div>

        {result && (
          <Alert
            className={`${
              result.includes("successfully") || result.includes("Successfully") || result.includes("enrolled")
                ? "border-green-200 bg-green-50"
                : result.includes("Network error")
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <AlertDescription
              className={
                result.includes("successfully") || result.includes("Successfully") || result.includes("enrolled")
                  ? "text-green-800"
                  : result.includes("Network error")
                  ? "text-red-800"
                  : "text-yellow-800"
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
                         disabled={step === "generating" || step === "completed"}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
