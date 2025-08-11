'use client'

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ATP Cloud Dashboard - INTERNAL TESTING</title>
        <meta name="description" content="Agent Trust Protocol Cloud Management Dashboard - Internal Testing Only" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>
        <div className="min-h-screen">
          {/* Development Warning Banner */}
          <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
            ⚠️ INTERNAL TESTING ONLY - ATP Cloud Dashboard v0.1.0-alpha
          </div>
          
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}