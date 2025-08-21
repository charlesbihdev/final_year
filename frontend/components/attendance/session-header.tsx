import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pause, Play } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { ExamSession } from "@/types";

interface SessionHeaderProps {
  session: ExamSession;
  onToggleSession: (activate: boolean) => Promise<void>;
  isLoading: boolean;
}

export function SessionHeader({
  session,
  onToggleSession,
  isLoading,
}: SessionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/invigilator">
        <Button variant="outline" size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </Link>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {session.course?.title} - Attendance
        </h1>
        <p className="text-gray-600">
          {format(new Date(session.date), "PPP")} • {session.start_time} -{" "}
          {session.end_time}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={session.is_active ? "default" : "secondary"}>
          {session.is_active ? "Active" : "Inactive"}
        </Badge>
        <Button
          variant={session.is_active ? "destructive" : "default"}
          onClick={() => onToggleSession(!session.is_active)}
          disabled={isLoading}
          className="gap-2"
        >
          {session.is_active ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {session.is_active ? "Stop Session" : "Start Session"}
        </Button>
      </div>
    </div>
  );
}
