'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface DataTableProps {
  columns: {
    header: string
    accessorKey?: string
    cell?: (item: any) => React.ReactNode
  }[]
  data: any[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
}

export function DataTable({ 
  columns, 
  data, 
  loading, 
  pagination 
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="text-[#A1A1AA] text-sm font-medium animate-pulse">Loading data...</span>
      </div>
    )
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#161616] bg-[#111111] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#161616]">
            <TableRow className="hover:bg-transparent border-[#262626]">
              {columns.map((column, i) => (
                <TableHead key={i} className="text-[#A1A1AA] font-bold text-xs uppercase tracking-wider py-4 px-6">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, i) => (
                <TableRow key={i} className="border-[#161616] hover:bg-[#0A0A0A] transition-colors group">
                  {columns.map((column, j) => (
                    <TableCell key={j} className="py-2 px-6">
                      {column.cell ? column.cell(item) : item[column.accessorKey!]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-60 text-center text-[#52525B] text-sm italic py-20 bg-[#111111]">
                   <div className="flex flex-col items-center gap-2">
                     <span className="text-3xl">📭</span>
                     <p className="font-semibold text-white mt-2">No results found</p>
                     <p className="text-xs text-[#52525B]">It looks like there's nothing here yet.</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2 pt-4">
          <p className="text-xs font-semibold text-[#52525B] uppercase tracking-widest">
            Showing {Math.min(data.length, pagination.pageSize)} of {pagination.total} entries
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="bg-[#111111] border-[#262626] text-white hover:bg-[#161616] hover:text-[#7C3AED] h-10 w-10 p-0 rounded-xl disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-bold text-white px-4">{pagination.page} / {totalPages || 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="bg-[#111111] border-[#262626] text-white hover:bg-[#161616] hover:text-[#7C3AED] h-10 w-10 p-0 rounded-xl disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
