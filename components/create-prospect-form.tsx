"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Upload } from "lucide-react"
import { createProspectAction, importProspectsAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function CreateProspectForm({ markets, niches }: { markets: string[]; niches: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors rounded-xl"
      >
        <span className="font-semibold text-sm text-sales-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Add or Import Prospects
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-6 border-t border-slate-100">
          {/* Create single prospect */}
          <div className="pt-4">
            <h3 className="font-semibold text-sm text-sales-900 mb-3">Create Prospect</h3>
            <form action={createProspectAction} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Business Name *</label>
                  <input name="businessName" required className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Phone *</label>
                  <input name="phone" required className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Market</label>
                  <select name="market" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    {markets.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Niche</label>
                  <select name="niche" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    {niches.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Assigned Rep</label>
                  <select name="assignedRep" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <option>Josh</option>
                    <option>Paul</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">City</label>
                  <input name="city" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Website</label>
                  <input name="website" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Outreach Hook</label>
                <textarea name="outreachHook" rows={2} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Prospect
              </Button>
            </form>
          </div>

          {/* Import JSON */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-sm text-sales-900 mb-3">Import Prospects (JSON)</h3>
            <form action={importProspectsAction} className="space-y-3">
              <textarea
                name="json"
                rows={4}
                placeholder='[{"businessName":"...","market":"Field Service","niche":"plumbing","phone":"555-0100","assignedRep":"Josh"}]'
                className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
              <Button type="submit" variant="outline" className="text-sm">
                <Upload className="w-3.5 h-3.5 mr-1" /> Import JSON
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
