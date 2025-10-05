import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Token Dashboard',
  description: 'Live token price and RSI dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
