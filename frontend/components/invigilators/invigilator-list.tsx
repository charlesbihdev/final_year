"use client"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from 'lucide-react'
import type { Invigilator } from "@/types"

interface InvigilatorListProps {
  invigilators: Invigilator[]
  isLoading: boolean
  onEdit: (invigilator: Invigilator) => void
  onDelete: (invigilatorId: number) => void
}

export function InvigilatorList({ invigilators, isLoading, onEdit, onDelete }: InvigilatorListProps) {
  const columns = [
    {
      key: 'user.name',
      label: 'Name',
      render: (invigilator: Invigilator) => invigilator.user?.name || '-'
    },
    {
      key: 'user.email',
      label: 'Email',
      render: (invigilator: Invigilator) => invigilator.user?.email || '-'
    },
    {
      key: 'department',
      label: 'Department',
      render: (invigilator: Invigilator) => invigilator.department || '-'
    }
  ]

  const actions = (invigilator: Invigilator) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(invigilator)}
        title="Edit Invigilator"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(invigilator.id)}
        className="text-red-600 hover:text-red-700"
        title="Delete Invigilator"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <DataTable
      data={invigilators}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchPlaceholder="Search invigilators..."
      emptyMessage="No invigilators found. Add your first invigilator to get started."
    />
  )
}
