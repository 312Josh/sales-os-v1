"use client";

import { useState } from "react";
import { Phone, Globe, Mail, MessageSquare, CheckCircle, ExternalLink, PhoneMissed, Sparkles, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CallDispositionForm } from "@/components/call-disposition-form";
import { getBookingState, getBookingStateLabel } from "@/lib/booking-state";
import { computeCompositeGrade, getGradeColor, getGradeLabel } from "@/lib/composite-grade";
import { runSingleAuditAction } from "@/lib/actions";
import type { Prospect, MeetingRecord, CallLog } from "@/lib/types";

const NICHE_COLORS: Record<string, string> = {
  garage_door: "bg-orange-100 text-orange-700 border-orange-200",
  electrical: "bg-yellow-100 text-yellow-700 border-yellow-200",
  plumbing: "bg-blue-100 text-blue-700 border-blue-200",
  hvac: "bg-red-100 text-red-700 border-red-200",
  law: "bg-purple-100 text-purple-700 border-purple-200",
  cpa: "bg-emerald-100 text-emerald-700 border-emerald-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

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
};

function nicheLabel(niche: string): string {
  return niche?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
}

function stageLabel(stage: string): string {
  return stage?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
}

function buildSmsBody(prospect: Prospect, type: "intro" | "no_answer"): string {
  if (type === "no_answer") {
    return `Hi, this is Josh from CoGrow. I tried calling about your business ${prospect.businessName} — wanted to share something that could help you get more customers. Can I call back at a better time?`;
  }
  return `Hi, this is Josh from CoGrow. I help ${nicheLabel(prospect.niche || prospect.vertical || "")} businesses like ${prospect.businessName} get more customers with faster lead response. Got 2 min to chat?`;
}

function buildGoogleVoiceSmsUrl(phone: string, body: string): string {
  // Google Voice SMS via web
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://voice.google.com/u/0/messages?compose=${cleanPhone}&text=${encodeURIComponent(body)}`;
}

export function CallQueue({ prospects, meetings = [], calls = [] }: { prospects: Prospect[]; meetings?: MeetingRecord[]; calls?: CallLog[] }) {
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const niches = [...new Set(prospects.map((p) => p.vertical || p.niche || "unknown"))].sort();
  const markets = [...new Set(prospects.map((p) => p.marketTag || p.market || "unknown"))].sort();
  const stages = [...new Set(prospects.map((p) => p.pipelineStage))].sort();

  const filtered = prospects.filter((p) => {
    const v = p.vertical || p.niche || "unknown";
    const m = p.marketTag || p.market || "unknown";
    if (verticalFilter !== "all" && v !== verticalFilter) return false;
    if (marketFilter !== "all" && m !== marketFilter) return false;
    if (stageFilter !== "all" && p.pipelineStage !== stageFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-sales-900 sm:mr-auto">Call Queue</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={verticalFilter}
            onChange={(e) => setVerticalFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[44px]"
          >
            <option value="all">All Verticals</option>
            {niches.map((n) => (
              <option key={n} value={n}>{nicheLabel(n)}</option>
            ))}
          </select>
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[44px]"
          >
            <option value="all">All Markets</option>
            {markets.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[44px]"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>{stageLabel(s)}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-slate-400">{filtered.length} prospects</span>
      </div>

      {/* Card Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} meeting={meetings.find(m => m.prospectId === prospect.id)} calls={calls} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg font-medium">No prospects match filters</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

function ProspectCard({ prospect, meeting, calls = [] }: { prospect: Prospect; meeting?: MeetingRecord; calls?: CallLog[] }) {
  const [showNoAnswer, setShowNoAnswer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const nicheClass = NICHE_COLORS[prospect.niche] || NICHE_COLORS[prospect.vertical || ""] || NICHE_COLORS.default;
  const bookingState = getBookingState(prospect, meeting);
  const compositeGrade = computeCompositeGrade(prospect, calls);
  const gradeColor = getGradeColor(compositeGrade);
  const gradeLabel = getGradeLabel(compositeGrade);
  const stageClass = STAGE_COLORS[prospect.pipelineStage] || STAGE_COLORS.sourced;
  const hook = prospect.callOpener || prospect.idealPitchAngle || prospect.outreachHook || "";

  const introSms = buildSmsBody(prospect, "intro");
  const noAnswerSms = buildSmsBody(prospect, "no_answer");

  return (
    <Card className="group hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <CardContent className="pt-5 pb-4 px-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className={`text-[11px] font-bold px-2 py-0.5 ${gradeColor} shrink-0`}>{compositeGrade}</Badge>
            <h3 className="font-bold text-sales-900 text-[15px] leading-tight truncate">{prospect.businessName}</h3>
          </div>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${stageClass} shrink-0`}>
            {stageLabel(prospect.pipelineStage)}
          </Badge>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className={`text-[10px] ${nicheClass}`}>{nicheLabel(prospect.niche || prospect.vertical || "")}</Badge>
          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">{prospect.marketTag || prospect.market}</Badge>
          {(prospect.priorityBucket === 'hot' || prospect.priorityScore > 70) && <Badge className="text-[10px] bg-red-500 text-white border-0">Hot</Badge>}
          {prospect.priorityBucket === 'warm' && prospect.priorityScore <= 70 && <Badge className="text-[10px] bg-amber-500 text-white border-0">Warm</Badge>}
          {!prospect.contactFormPresent && !prospect.contactFormUrl && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">No Form</Badge>}
          {prospect.chatPresent && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">Has Chat</Badge>}
          {prospect.onlineBookingPresent && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">Has Booking</Badge>}
          {prospect.contactStatus === 'replied' && <Badge className="text-[10px] bg-green-500 text-white border-0">📱 Replied</Badge>}
          {prospect.siteHealthGrade && (
            <Badge variant="outline" className={`text-[10px] ${
              prospect.siteHealthGrade === 'D' ? 'bg-red-50 text-red-600 border-red-200' :
              prospect.siteHealthGrade === 'C' ? 'bg-orange-50 text-orange-600 border-orange-200' :
              prospect.siteHealthGrade === 'B' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
              'bg-green-50 text-green-600 border-green-200'
            }`}>Site {prospect.siteHealthGrade}</Badge>
          )}
          {bookingState === 'sent' && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">📅 Link Sent</Badge>}
          {bookingState === 'awaiting_booking' && <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-600 border-violet-200">📅 Awaiting</Badge>}
          {bookingState === 'booked' && <Badge className="text-[10px] bg-emerald-500 text-white border-0">📅 Booked</Badge>}
          {bookingState === 'completed' && <Badge className="text-[10px] bg-green-600 text-white border-0">✅ Complete</Badge>}
        </div>

        {/* Contact */}
        <div className="space-y-1.5 mb-3 text-sm">
          {(prospect.decisionMaker || prospect.decisionMakerTitle) && (
            <div className="flex items-center gap-2 text-slate-700 min-h-[28px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium">{prospect.decisionMaker}{prospect.decisionMakerTitle ? ` · ${prospect.decisionMakerTitle}` : ''}</span>
            </div>
          )}
          {prospect.phone && (
            <a href={`tel:${prospect.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors min-h-[28px]">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{prospect.phone}</span>
            </a>
          )}
          {prospect.website && (
            <a href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors truncate min-h-[28px]">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{prospect.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
            </a>
          )}
        </div>

        {/* Hook */}
        {hook && (
          <p className="text-xs text-slate-500 italic line-clamp-2 mb-4 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            💡 {hook}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs min-h-[36px] px-3 rounded-lg" asChild>
            <a href={`tel:${prospect.phone}`}>
              <Phone className="w-3 h-3 mr-1" /> Call
            </a>
          </Button>
          <Button size="sm" variant="outline" className="text-xs min-h-[36px] px-3 rounded-lg border-slate-200" asChild>
            <a href={buildGoogleVoiceSmsUrl(prospect.phone, introSms)} target="_blank" rel="noreferrer">
              <MessageSquare className="w-3 h-3 mr-1" /> Text
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs min-h-[36px] px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowNoAnswer(!showNoAnswer)}
          >
            <PhoneMissed className="w-3 h-3 mr-1" /> No Answer
          </Button>
          {prospect.website && !auditing && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs min-h-[36px] px-3 rounded-lg border-sky-200 text-sky-600 hover:bg-sky-50"
              onClick={async () => {
                setAuditing(true)
                await runSingleAuditAction(prospect.id)
                setAuditing(false)
              }}
            >
              <Search className="w-3 h-3 mr-1" /> {prospect.siteHealthGrade ? 'Re-Audit' : 'Audit'}
            </Button>
          )}
          {auditing && (
            <span className="text-xs text-sky-500 animate-pulse px-2">Auditing...</span>
          )}
          {(prospect.vertical === 'field_service' || ['plumbing', 'hvac', 'electrical', 'garage_door', 'appliance'].includes(prospect.niche || '')) && (
            <Button size="sm" variant="outline" className="text-xs min-h-[36px] px-3 rounded-lg border-violet-200 text-violet-600 hover:bg-violet-50 ml-auto" asChild>
              <a href={`https://plumbing-os.vercel.app/api/generate-proof`} target="_blank" rel="noreferrer" title="Generate proof asset">
                <Sparkles className="w-3 h-3 mr-1" /> Proof
              </a>
            </Button>
          )}
          {prospect.vertical === 'professional_services' && (
            <Button size="sm" variant="outline" className="text-xs min-h-[36px] px-3 rounded-lg border-violet-200 text-violet-600 hover:bg-violet-50 ml-auto" asChild>
              <a href={`https://professional-services-os.vercel.app/api/generate-proof`} target="_blank" rel="noreferrer" title="Generate proof asset">
                <Sparkles className="w-3 h-3 mr-1" /> Proof
              </a>
            </Button>
          )}
        </div>

        {/* No-answer text drop */}
        {showNoAnswer && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
              <PhoneMissed className="w-3 h-3" /> No-answer text drop
            </p>
            <p className="text-xs text-red-600 mb-2 italic">&ldquo;{noAnswerSms}&rdquo;</p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs min-h-[36px] px-3 rounded-lg" asChild>
                <a href={buildGoogleVoiceSmsUrl(prospect.phone, noAnswerSms)} target="_blank" rel="noreferrer">
                  <MessageSquare className="w-3 h-3 mr-1" /> Send via Google Voice
                </a>
              </Button>
              <Button size="sm" variant="outline" className="text-xs min-h-[36px] px-3 rounded-lg border-red-200" onClick={() => setShowNoAnswer(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Expand toggle for call disposition */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors py-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide" : "Log Call"}
        </button>

        {/* Inline call disposition */}
        {expanded && (
          <div className="mt-3">
            <CallDispositionForm prospect={prospect} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
