import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sales OS v1',
  description: 'Call-centered rep workflow shell for Josh and Paul',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
