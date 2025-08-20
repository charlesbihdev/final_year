"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAttendance } from "./AttendanceProvider";

export function AttendanceOverview() {
  const { 
    attendanceRecords, 
    enrolledStudents, 
    refreshData,
    isLoading 
  } = useAttendance();

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance Summary</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          {attendanceRecords.length} of {enrolledStudents.length} students present
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendanceRecords.map((record) => (
            <div 
              key={record.id} 
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div>
                <div className="font-medium">{record.student?.user?.name}</div>
                <div className="text-sm text-gray-600">{record.student?.student_id}</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  {record.method}
                </Badge>
                <div className="text-xs text-gray-500">
                  {format(new Date(record.timestamp), "HH:mm")}
                </div>
              </div>
            </div>
          ))}
          
          {attendanceRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records yet. Students can mark attendance using face recognition or manual entry.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 