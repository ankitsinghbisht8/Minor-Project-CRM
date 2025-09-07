import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'

export const DetailsModal = ({ row, onClose, isDarkMode }) => {
  return (
    <Dialog.Root open={!!row} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl backdrop-blur-md border p-5 shadow-xl ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/70 border-gray-200'}`}>
            <Dialog.Title className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer Details</Dialog.Title>
            <Dialog.Description className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>A quick summary of key metrics</Dialog.Description>
            {row && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>ID</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{row.id}</span></div>
                <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Name</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{row.name}</span></div>
                <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Plan</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{row.plan}</span></div>
                <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Region</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{row.region}</span></div>
                <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>MRR</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>${row.mrr}</span></div>
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <button className={`px-4 py-2 rounded-lg border text-sm ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} onClick={onClose}>Close</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


