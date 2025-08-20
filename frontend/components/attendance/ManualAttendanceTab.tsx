"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

export function ManualAttendanceTab() {
  const { 
    enrolledStudents, 
    attendanceRecords, 
    markAttendance,
    isLoading 
  } = useAttendance();
  
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students for search
  const filteredStudents = enrolledStudents.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.index_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get attendance status for a student
  const getStudentAttendanceStatus = (studentId: number) => {
    return attendanceRecords.find(record => record.student_id === studentId);
  };

  const handleMarkAttendance = async (studentId: number) => {
    await markAttendance(studentId, 'manual');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Manual Attendance Entry
        </CardTitle>
        <CardDescription>
          Search and manually mark students as present
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredStudents.map((student) => {
            const attendance = getStudentAttendanceStatus(student.id);
            const isPresent = !!attendance;

            return (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  isPresent ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.index_number}</div>
                </div>
                <div className="flex items-center gap-2">
                  {isPresent && (
                    <Badge variant="secondary">
                      Present ({attendance.method})
                    </Badge>
                  )}
                  <Button
                    variant={isPresent ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleMarkAttendance(student.id)}
                    disabled={isPresent || isLoading}
                  >
                    {isPresent ? "Present" : "Mark Present"}
                  </Button>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found. Try adjusting your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 