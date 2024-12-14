'use client'

import { Toaster } from 'sonner'

export function ToastContainer() {
  return (
    <Toaster 
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'rgb(31, 41, 55)',
          border: '1px solid rgb(55, 65, 81)',
          color: 'white',
        },
      }}
    />
  )
}

export { toast } from 'sonner' 