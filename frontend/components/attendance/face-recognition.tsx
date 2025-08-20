import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";

interface FaceRecognitionProps {
  onRecognize: (file: File) => Promise<void>;
  isProcessing: boolean;
  recognitionResult: any | null;
}

export function FaceRecognition({
  onRecognize,
  isProcessing,
  recognitionResult,
}: FaceRecognitionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      await onRecognize(selectedFile);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Face Recognition Attendance
        </CardTitle>
        <CardDescription>
          Upload a photo to automatically identify and mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!preview ? (
            <div 
              className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click to upload a photo</p>
                <p className="text-sm text-gray-400">Support for JPG, PNG files</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg border"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Recognize Face"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {recognitionResult && (
          <Alert className={recognitionResult.matched ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {recognitionResult.matched ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {recognitionResult.matched ? (
                <div>
                  <div className="font-semibold text-green-800">
                    Student Recognized: {recognitionResult.student?.student_name}
                  </div>
                  <div className="text-sm text-green-700">
                    Confidence: {(recognitionResult.similarity * 100).toFixed(1)}%
                  </div>
                </div>
              ) : (
                <div className="text-red-800">
                  {recognitionResult.message || "No matching face found"}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
