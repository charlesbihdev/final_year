"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                      <Select
            value={filters.sessionId || "all"}
            onValueChange={(value) => updateFilter("sessionId", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sessions</SelectItem>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.course?.title} - {session.date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          {/* Student Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
                      <Select
            value={filters.studentId || "all"}
            onValueChange={(value) => updateFilter("studentId", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All students</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.user?.name} ({student.student_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
                      <Select
            value={filters.courseId || "all"}
            onValueChange={(value) => updateFilter("courseId", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.code} - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
