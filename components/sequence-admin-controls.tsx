"use client"

import { useState } from 'react'
import { PlayCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SequenceAdminControls() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string>('')

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-sales-900">Sequence Admin</h2>
          <p className="text-xs text-slate-500 mt-1">Run due sequence steps now for testing. Chris wanted magic; this is what operational competence looks like.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            disabled={running}
            onClick={async () => {
              setRunning(true)
              setResult('')
              try {
                const res = await fetch('/api/cron/sequence-runner', { method: 'POST' })
                const json = await res.json()
                setResult(`Processed ${json.processed ?? 0} · Sent ${json.sent ?? 0} · Failed ${json.failed ?? 0} · Auto-stopped ${json.autoStopped ?? 0}`)
              } catch (e) {
                setResult('Runner failed')
                console.error(e)
              } finally {
                setRunning(false)
              }
            }}
          >
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
            Run Due Steps Now
          </Button>
          {result && <span className="text-xs text-slate-600">{result}</span>}
        </div>
      </div>
    </div>
  )
}
