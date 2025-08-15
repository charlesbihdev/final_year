"use client"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Play, Pause, UserPlus } from 'lucide-react' // Added UserPlus
import type { ExamSession } from "@/types"

interface SessionListProps {
  sessions: ExamSession[]
  isLoading: boolean
  onEdit: (session: ExamSession) => void
  onDelete: (sessionId: number) => void
  onToggle: (sessionId: number, isActive: boolean) => void
  onAssignInvigilators: (session: ExamSession) => void // New prop
}

export function SessionList({ sessions, isLoading, onEdit, onDelete, onToggle, onAssignInvigilators }: SessionListProps) {
  const columns = [
    {
      key: 'course.title',
      label: 'Course',
      render: (session: ExamSession) => (
        <div>
          <div className="font-medium">{session.course?.title || '-'}</div>
          <div className="text-sm text-gray-500">{session.course?.code}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (session: ExamSession) => new Date(session.date).toLocaleDateString()
    },
    {
      key: 'start_time',
      label: 'Time',
      render: (session: ExamSession) => `${session.start_time} - ${session.end_time}`
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (session: ExamSession) => (
        <Badge variant={session.is_active ? "default" : "secondary"}>
          {session.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    { // New column for Invigilators
      key: 'invigilators',
      label: 'Invigilators',
      render: (session: ExamSession) => (
        <div className="flex flex-wrap gap-1">
          {session.invigilators && session.invigilators.length > 0 ? (
            session.invigilators.map(inv => (
              <Badge key={inv.id} variant="outline" className="text-xs">
                {inv.user?.name || inv.staff_id}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-sm">-</span>
          )}
        </div>
      )
    }
  ]

  const actions = (session: ExamSession) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAssignInvigilators(session)}
        title="Assign Invigilators"
      >
        <UserPlus className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(session.id, session.is_active)}
        title={session.is_active ? "Deactivate Session" : "Activate Session"}
      >
        {session.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(session)}
        title="Edit Session"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(session.id)}
        className="text-red-600 hover:text-red-700"
        title="Delete Session"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <DataTable
      data={sessions}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchPlaceholder="Search sessions..."
      emptyMessage="No exam sessions found. Create your first session to get started."
    />
  )
}
