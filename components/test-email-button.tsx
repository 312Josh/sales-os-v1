"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestEmailButton() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="sm:mr-auto">
          <h2 className="text-sm font-bold text-sales-900">Email Verification</h2>
          <p className="text-xs text-slate-500 mt-1">Send a live Resend test email to verify Paul&apos;s sender domain once DNS is ready.</p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            setStatus('')
            try {
              const res = await fetch('/api/test-email', { method: 'POST' })
              const json = await res.json()
              setStatus(json.ok ? `Sent${json.id ? ` (${json.id})` : ''}` : `Failed: ${json.error}`)
            } catch (e: any) {
              setStatus(`Failed: ${e?.message || 'Unknown error'}`)
            } finally {
              setLoading(false)
            }
          }}
        >
          {loading ? 'Sending…' : 'Send Test Email'}
        </Button>
        {status && <div className="text-xs text-slate-600 break-all">{status}</div>}
      </div>
    </div>
  )
}
