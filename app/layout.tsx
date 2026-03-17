import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sales OS',
  description: 'Call-centered rep workflow — queue, context, fast logging',
}

function NavBar() {
  return (
    <nav className="bg-sales-900 text-white border-b border-sales-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="bg-blue-500 text-white w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold">S</span>
            Sales OS
            <span className="text-[10px] text-slate-500 font-normal ml-1.5 hidden sm:inline">by CoGrow</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              Queue
            </Link>
            <Link href="/prospects" className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              Prospects
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile nav links */}
          <div className="flex sm:hidden items-center gap-1 mr-2">
            <Link href="/" className="px-2 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10">Queue</Link>
            <Link href="/prospects" className="px-2 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10">Prospects</Link>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Josh Mellender</span>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">JM</div>
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
