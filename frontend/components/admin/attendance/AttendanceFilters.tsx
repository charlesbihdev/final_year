"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Filter, CalendarIcon, RotateCcw, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Student, Course, ExamSession } from "@/types";

interface FilterOptions {
  sessionId: string;
  studentId: string;
  courseId: string;
  dateRange: { from?: Date; to?: Date };
}

interface AttendanceFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  students: Student[];
  courses: Course[];
  sessions: ExamSession[];
  isLoading: boolean;
}

export function AttendanceFilters({
  filters,
  onFiltersChange,
  students,
  courses,
  sessions,
  isLoading,
}: AttendanceFiltersProps) {
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      sessionId: "",
      studentId: "",
      courseId: "",
      dateRange: {},
    });
  };

  const clearDateRange = () => {
    updateFilter("dateRange", {});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.sessionId) count++;
    if (filters.studentId) count++;
    if (filters.courseId) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Session Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Session</label>
            <select
              value={filters.sessionId || "all"}
              onChange={(e) => updateFilter("sessionId", e.target.value === "all" ? "" : e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id.toString()}>
                  {session.course?.title} - {session.date}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
            <select
              value={filters.studentId || "all"}
              onChange={(e) => updateFilter("studentId", e.target.value === "all" ? "" : e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id.toString()}>
                  {student.user?.name} ({student.student_id})
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <select
              value={filters.courseId || "all"}
              onChange={(e) => updateFilter("courseId", e.target.value === "all" ? "" : e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id.toString()}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => {
                    updateFilter("dateRange", range || {});
                    if (range?.from && range?.to) {
                      setIsDatePopoverOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDateRange}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
