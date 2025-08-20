"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Download } from "lucide-react";
import { format } from "date-fns";
import { CSVParser } from "@/lib/csv-utils";
import type { AttendanceRecord } from "@/types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export function AttendanceTable({
  records,
  isLoading,
  searchTerm,
  onSearchChange,
}: AttendanceTableProps) {
  const columns = [
    {
      key: "student.user.name",
      label: "Student Name",
      render: (record: AttendanceRecord) => record.student?.user?.name || "N/A",
    },
    {
      key: "student.student_id",
      label: "Student ID",
      render: (record: AttendanceRecord) => record.student?.student_id || "N/A",
    },
    {
      key: "session",
      label: "Session",
      render: (record: AttendanceRecord) =>
        record.session ? (
          <div>
            <div className="font-medium">
              {record.session.course?.title || "Unknown Course"}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(record.session.date), "PPP")} at{" "}
              {record.session.start_time}
            </div>
          </div>
        ) : (
          "N/A"
        ),
    },
    {
      key: "method",
      label: "Method",
      render: (record: AttendanceRecord) => (
        <Badge variant={record.method === "face" ? "default" : "secondary"}>
          {record.method}
        </Badge>
      ),
    },
    {
      key: "timestamp",
      label: "Timestamp",
      render: (record: AttendanceRecord) =>
        format(new Date(record.timestamp), "PPp"),
    },
    {
      key: "status",
      label: "Status",
      render: (record: AttendanceRecord) => (
        <Badge variant={record.status === "present" ? "default" : "destructive"}>
          {record.status || "present"}
        </Badge>
      ),
    },
  ];

  const exportToCSV = () => {
    const csvData = records.map((record) => ({
      "Student Name": record.student?.user?.name || "N/A",
      "Student ID": record.student?.student_id || "N/A",
      "Course": record.session?.course?.title || "N/A",
      "Session Date": record.session?.date || "N/A",
      "Session Time": record.session?.start_time || "N/A",
      "Method": record.method,
      "Status": record.status || "present",
      "Timestamp": format(new Date(record.timestamp), "PPp"),
    }));

    CSVParser.exportToCSV(csvData, `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Attendance Records ({records.length})
            </CardTitle>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={records}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search by student name, ID, or course..."
          emptyMessage="No attendance records found with current filters"
        />
      </CardContent>
    </Card>
  );
}
