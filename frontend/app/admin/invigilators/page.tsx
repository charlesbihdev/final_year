"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { InvigilatorList } from "@/components/invigilators/invigilator-list"
import { InvigilatorForm } from "@/components/invigilators/invigilator-form"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { api } from "@/lib/api"
import type { Invigilator } from "@/types"

export default function InvigilatorsPage() {
  const [invigilators, setInvigilators] = useState<Invigilator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInvigilator, setEditingInvigilator] = useState<Invigilator | null>(null)

  useEffect(() => {
    fetchInvigilators()
  }, [])

  const fetchInvigilators = async () => {
    setIsLoading(true)
    const response = await api.get<Invigilator[]>('/invigilators')
    if (response.success && response.data) {
      setInvigilators(response.data)
    }
    setIsLoading(false)
  }

  const handleCreateInvigilator = () => {
    setEditingInvigilator(null)
    setShowForm(true)
  }

  const handleEditInvigilator = (invigilator: Invigilator) => {
    setEditingInvigilator(invigilator)
    setShowForm(true)
  }

  const handleDeleteInvigilator = async (invigilatorId: number) => {
    if (confirm('Are you sure you want to delete this invigilator?')) {
      const response = await api.delete(`/invigilators/${invigilatorId}`)
      if (response.success) {
        fetchInvigilators()
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingInvigilator(null)
    fetchInvigilators()
  }

  return (
    <AdminLayout currentPage="invigilators">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Invigilator Management</h2>
            <p className="text-gray-600">Register and manage invigilator accounts</p>
          </div>
          <Button onClick={handleCreateInvigilator} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Invigilator
          </Button>
        </div>

        <InvigilatorList
          invigilators={invigilators}
          isLoading={isLoading}
          onEdit={handleEditInvigilator}
          onDelete={handleDeleteInvigilator}
        />

        <InvigilatorForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          invigilator={editingInvigilator}
          onSuccess={handleFormSuccess}
        />
      </div>
    </AdminLayout>
  )
}
