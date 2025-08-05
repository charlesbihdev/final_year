"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  Clock,
  FileSpreadsheet,
  UserPlus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface Student {
  id: number;
  index_number: string;
  student_name: string;
  class: string;
  timeReported?: string;
  status?: "present" | "absent";
}

interface ClassData {
  id: string;
  name: string;
  students: Student[];
}

export default function DashboardPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Registration state
  const [registrationForm, setRegistrationForm] = useState({
    student_name: "",
    index_number: "",
    class_: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    message: string;
    name: string;
    index_number: string;
  } | null>(null);

  // Students list state
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Training state
  const [trainingPhotos, setTrainingPhotos] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<string | null>(null);

  // Fetch students every 5 minutes
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/students`
      );
      const data = await response.json();
      // console.log("Fetched students:", data);
      setAllStudents(data);
    } catch (error) {
      // console.error("Error fetching students:", error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchStudents();

    // Set up interval for revalidation every 5 minutes
    const interval = setInterval(fetchStudents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`
      );
      const data = await response.json();
      // console.log("Fetched classes:", data);
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      // console.error("Error fetching classes:", error);
      // Mock data for demo
      const mockData = [
        {
          id: "cs101",
          name: "Computer Science 101",
          students: [],
        },
        {
          id: "math201",
          name: "Mathematics 201",
          students: [],
        },
      ];
      setClasses(mockData);
      setSelectedClass(mockData[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegistrationResult(null);

    // Validate form data
    if (
      !registrationForm.student_name ||
      !registrationForm.index_number ||
      !registrationForm.class_
    ) {
      console.error("All fields are required");
      setRegistrationResult({
        message: "All fields are required",
        name: "",
        index_number: "",
      });
      setIsRegistering(false);
      return;
    }

    const formData = new FormData();
    formData.append("student_name", registrationForm.student_name.trim());
    formData.append("index_number", registrationForm.index_number.trim());
    formData.append("class_", registrationForm.class_.trim());

    try {
      console.log("Sending FormData:", {
        student_name: registrationForm.student_name.trim(),
        index_number: registrationForm.index_number.trim(),
        class_: registrationForm.class_.trim(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/students`,
        {
          method: "POST",
          body: formData,
          // Do not set Content-Type header; browser sets it automatically for FormData
        }
      );

      const data = await response.json();
      // console.log("Registration response:", JSON.stringify(data, null, 2));
      setRegistrationResult(data);

      if (response.ok) {
        setRegistrationForm({ student_name: "", index_number: "", class_: "" });
        fetchStudents();
      } else {
        console.error("Validation error:", data);
        setRegistrationResult({
          message: "Validation error",
          name: "",
          index_number: "",
        });
      }
    } catch (error) {
      console.error("Error registering student:", error);
      setRegistrationResult({
        message: "Error registering student",
        name: "",
        index_number: "",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTrainingPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setTrainingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTraining = async () => {
    if (!selectedStudent || trainingPhotos.length < 5) {
      alert("Please select a student and upload at least 5 photos");
      return;
    }

    setIsTraining(true);
    setTrainingResult(null);

    try {
      const formData = new FormData();
      formData.append("student_id", selectedStudent.id.toString());
      trainingPhotos.forEach((file) => formData.append("photos", file));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/train`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setTrainingResult(data.message || "Training completed successfully");

      console.log("Training response:", data.message);

      if (response.ok) {
        setTrainingPhotos([]);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Error training model:", error);
      setTrainingResult("Error training model");
    } finally {
      setIsTraining(false);
    }
  };

  const filteredStudents = allStudents.filter(
    (student) =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.index_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentClass = Array.isArray(classes)
    ? classes.find((c) => c.id === selectedClass)
    : null;

  const exportToCSV = () => {
    if (!currentClass) return;

    const headers = ["Index Number", "Student Name", "Status", "Time Reported"];
    const rows = currentClass.students.map((student) => [
      student.index_number,
      student.student_name,
      student.status || "absent",
      student.timeReported
        ? new Date(student.timeReported).toLocaleString()
        : "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentClass.name}_attendance_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Manage students, attendance, and model training
            </p>
          </div>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="register">Register Student</TabsTrigger>
            <TabsTrigger value="training">Train Model</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Class Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(classes) &&
                      classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {currentClass && (
              <>
                {/* Class Header */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          {currentClass.name}
                        </CardTitle>
                        <CardDescription>
                          Total Students: {currentClass.students.length}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={exportToCSV}
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Attendance List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Attendance Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentClass.students.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No attendance records found for this class.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentClass.students.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white border rounded-lg p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <div className="font-medium">
                                  {student.student_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {student.index_number}
                                </div>
                              </div>
                              <div className="flex flex-col sm:items-end gap-1">
                                <Badge variant="secondary" className="w-fit">
                                  {student.status || "Absent"}
                                </Badge>
                                {student.timeReported && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      student.timeReported
                                    ).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Register Student Tab */}
          <TabsContent value="register" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register New Student
                </CardTitle>
                <CardDescription>
                  Add a new student to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <Label htmlFor="student_name">Student Name</Label>
                    <Input
                      id="student_name"
                      value={registrationForm.student_name}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          student_name: e.target.value,
                        }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="index_number">Index Number</Label>
                    <Input
                      id="index_number"
                      value={registrationForm.index_number}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          index_number: e.target.value,
                        }))
                      }
                      placeholder="e.g., FOE.41.008.209.33"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={registrationForm.class_}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          class_: e.target.value,
                        }))
                      }
                      placeholder="e.g., Computer Science 101"
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full"
                  >
                    {isRegistering ? "Registering..." : "Register Student"}
                  </Button>
                </form>

                {registrationResult && (
                  <Alert
                    className={`mt-4 ${
                      registrationResult?.message?.includes("successfully")
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <AlertDescription
                      className={
                        registrationResult?.message?.includes("successfully")
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    >
                      <div className="font-semibold">
                        {registrationResult?.message}
                      </div>
                      {registrationResult.name && (
                        <div className="text-sm mt-1">
                          Name: {registrationResult.name} | Index:{" "}
                          {registrationResult.index_number}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Select Student for Training
                </CardTitle>
                <CardDescription>
                  Search and select a student to train the recognition model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Students</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, index number, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="font-medium">{student.student_name}</div>
                      <div className="text-sm text-gray-600">
                        {student.index_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.class}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedStudent && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      <div className="font-semibold">
                        Selected: {selectedStudent.student_name}
                      </div>
                      <div className="text-sm">
                        {selectedStudent.index_number} | {selectedStudent.class}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Training Photos
                </CardTitle>
                <CardDescription>
                  Upload at least 5 photos of the selected student for training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="photos">Select Photos (minimum 5)</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="mt-1"
                  />
                </div>

                {trainingPhotos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Selected Photos ({trainingPhotos.length}/5+ required)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {trainingPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={
                              URL.createObjectURL(photo) || "/placeholder.svg"
                            }
                            alt={`Training photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleTraining}
                  disabled={
                    !selectedStudent || trainingPhotos.length < 5 || isTraining
                  }
                  className="w-full"
                >
                  {isTraining
                    ? "Training Model..."
                    : `Train Model (${trainingPhotos.length}/5+ photos)`}
                </Button>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-gray-600">
                      Training in progress...
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}

                {trainingResult && (
                  <Alert
                    className={`${
                      trainingResult.includes("Successfully")
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <AlertDescription
                      className={
                        trainingResult.includes("Successfully")
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    >
                      {trainingResult}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
