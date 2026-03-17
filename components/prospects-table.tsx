"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Search, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Prospect } from "@/lib/types"

const STAGE_COLORS: Record<string, string> = {
  call_queued: "bg-blue-50 text-blue-700 border-blue-200",
  called: "bg-slate-50 text-slate-600 border-slate-200",
  follow_up_sent: "bg-amber-50 text-amber-700 border-amber-200",
  meeting_booked: "bg-emerald-50 text-emerald-700 border-emerald-200",
  proposal_sent: "bg-violet-50 text-violet-700 border-violet-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  closed_lost: "bg-red-50 text-red-700 border-red-200",
  sourced: "bg-gray-50 text-gray-600 border-gray-200",
  audited: "bg-sky-50 text-sky-700 border-sky-200",
}

function label(s: string): string {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || ""
}

type SortField = "businessName" | "priorityScore" | "pipelineStage" | "assignedRep" | "vertical" | "marketTag"
type SortDir = "asc" | "desc"

export function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("priorityScore")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [stageFilter, setStageFilter] = useState("all")
  const [repFilter, setRepFilter] = useState("all")

  const stages = useMemo(() => [...new Set(prospects.map(p => p.pipelineStage))].sort(), [prospects])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir(field === "businessName" ? "asc" : "desc")
    }
  }

  const filtered = useMemo(() => {
    let list = [...prospects]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.businessName.toLowerCase().includes(q) ||
        p.decisionMaker?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      )
    }
    if (stageFilter !== "all") list = list.filter(p => p.pipelineStage === stageFilter)
    if (repFilter !== "all") list = list.filter(p => p.assignedRep === repFilter)

    list.sort((a, b) => {
      const av = a[sortField] ?? ""
      const bv = b[sortField] ?? ""
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [prospects, search, sortField, sortDir, stageFilter, repFilter])

  function SortHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <th
        className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 select-none whitespace-nowrap"
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "text-blue-600" : "text-slate-300"}`} />
        </span>
      </th>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, contact, city, phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">All Reps</option>
          <option value="Josh">Josh</option>
          <option value="Paul">Paul</option>
        </select>
        <span className="text-sm text-slate-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortHeader field="businessName">Name</SortHeader>
                <SortHeader field="vertical">Vertical</SortHeader>
                <SortHeader field="marketTag">Market</SortHeader>
                <SortHeader field="pipelineStage">Stage</SortHeader>
                <SortHeader field="assignedRep">Rep</SortHeader>
                <SortHeader field="priorityScore">Score</SortHeader>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Site Grade</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Site</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-sm text-sales-900">{p.businessName}</div>
                    {p.decisionMaker && (
                      <div className="text-xs text-slate-400">{p.decisionMaker}{p.decisionMakerTitle ? ` · ${p.decisionMakerTitle}` : ""}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{label(p.vertical || p.niche || "")}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{p.marketTag || p.market}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${STAGE_COLORS[p.pipelineStage] || ""}`}>
                      {label(p.pipelineStage)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{p.assignedRep}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-600">{p.priorityScore}</td>
                  <td className="px-3 py-2.5">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="text-xs text-blue-600 hover:underline">{p.phone}</a>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.siteHealthGrade ? (
                      <Badge variant="outline" className={`text-[10px] ${
                        p.siteHealthGrade === 'D' ? 'bg-red-50 text-red-600 border-red-200' :
                        p.siteHealthGrade === 'C' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        p.siteHealthGrade === 'B' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>{p.siteHealthGrade}</Badge>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.website && (
                      <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <span className="truncate max-w-[140px]">{p.website.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">No prospects match your search</div>
        )}
      </div>
    </div>
  )
}
