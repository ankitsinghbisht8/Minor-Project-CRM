import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'

export const DetailsModal = ({ row, onClose }) => {
  return (
    <Dialog.Root open={!!row} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 p-5 shadow-xl dark:bg-gray-900/40 dark:border-gray-700">
            <Dialog.Title className="text-base font-semibold text-gray-900">Customer Details</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-gray-500">A quick summary of key metrics</Dialog.Description>
            {row && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-medium">{row.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{row.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-medium">{row.plan}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Region</span><span className="font-medium">{row.region}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">MRR</span><span className="font-medium">${row.mrr}</span></div>
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm" onClick={onClose}>Close</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


