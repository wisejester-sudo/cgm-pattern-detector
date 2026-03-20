import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { NetworkStatus } from '@/components/network-status'
import './globals.css'

// Force rebuild: rebuild-marker-2026
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dispatchly - Field Service Communication Tool',
  description: 'Manage jobs, dispatch technicians, and communicate with customers in real-time',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground" style={{ minHeight: '100vh' }}>
        {children}
        <Toaster position="top-right" richColors closeButton />
        <NetworkStatus />
        <Analytics />
      </body>
    </html>
  )
}
