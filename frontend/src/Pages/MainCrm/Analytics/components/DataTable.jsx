import React, { useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'

const columnHelper = createColumnHelper()

// columnsDef: optional array of { key, header, format?: (val, row) => ReactNode }
export const DataTable = ({ rows, onRowClick, columnsDef, isDarkMode }) => {
  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID', cell: (info) => info.getValue() }),
      columnHelper.accessor('name', { header: 'Name', cell: (info) => info.getValue() }),
      columnHelper.accessor('plan', { header: 'Plan', cell: (info) => info.getValue() }),
      columnHelper.accessor('region', { header: 'Region', cell: (info) => info.getValue() }),
      columnHelper.accessor('mrr', { header: 'MRR', cell: (info) => `$${info.getValue()}` }),
    ],
    []
  )

  const columns = useMemo(() => {
    if (!columnsDef || !Array.isArray(columnsDef)) return defaultColumns
    return columnsDef.map(def =>
      columnHelper.accessor(def.key, {
        header: def.header,
        cell: (info) => (def.format ? def.format(info.getValue(), info.row.original) : info.getValue()),
      })
    )
  }, [columnsDef, defaultColumns])

  const table = useReactTable({
    data: rows,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className={`px-5 py-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} cursor-pointer`} onClick={() => onRowClick?.(row.original)}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={`px-5 py-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-5 py-3">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Page {table.getState().pagination?.pageIndex + 1} of {table.getPageCount()}</div>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded border text-sm disabled:opacity-50 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</button>
          <button className={`px-3 py-1 rounded border text-sm disabled:opacity-50 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
        </div>
      </div>
    </div>
  )
}


