"use client";

import { getCallReport } from "@/store/customer";
import { CallReport } from "@/store/report/call-report/callreport.interface";
import { useEffect, useRef, useState } from "react";

/* ─── helpers ───────────────────────────────────────────────────────────── */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtShortDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ─── Mini Audio Player ─────────────────────────────────────────────────── */
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
    setProgress(ratio * 100);
  };

  const skip = (s: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.currentTime + s, audioRef.current.duration || 0)
    );
  };

  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  };

  return (
    <div className="rounded-xl border border-[var(--color-primary-lighter)] bg-[var(--color-primary-lighter)]/20 px-4 py-3">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      {/* Progress bar */}
      <div
        ref={barRef}
        onClick={seek}
        className="relative h-1 rounded-full bg-[var(--color-primary-lighter)] cursor-pointer mb-2 group"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary-dark)] transition-none"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-primary-darker)] border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-gray-400 w-8 shrink-0">{fmtTime(currentTime)}</span>

        <button onClick={() => skip(-10)} className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary-darker)] transition-colors shrink-0" title="−10s">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button
          onClick={toggle}
          className="w-7 h-7 rounded-full bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary-darker)] text-white flex items-center justify-center shadow transition-all active:scale-90 shrink-0"
        >
          {playing ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button onClick={() => skip(10)} className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary-darker)] transition-colors shrink-0" title="+10s">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        <span className="text-[10px] font-mono text-gray-400 shrink-0">{fmtTime(duration)}</span>
        <div className="flex-1" />

        <button onClick={toggleMute} className="text-gray-300 hover:text-[var(--color-primary-dark)] transition-colors shrink-0">
          {muted || volume === 0 ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        <input
          type="range" min={0} max={1} step={0.05}
          value={muted ? 0 : volume}
          onChange={changeVol}
          className="w-16 h-1 accent-[var(--color-primary-dark)] cursor-pointer"
        />
      </div>
    </div>
  );
}

/* ─── Sentiment Chip ────────────────────────────────────────────────────── */
function SentimentChip({ value }: { value: string }) {
  const v = parseFloat(value);
  const { bg, text, bar } =
    v >= 7
      ? { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-400" }
      : v >= 4
      ? { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" }
      : { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-400" };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${bar}`} />
      {v}/10
    </div>
  );
}

/* ─── Info Pill ─────────────────────────────────────────────────────────── */
function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="text-[var(--color-primary-dark)] opacity-60">{icon}</span>
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-600 truncate max-w-[160px]">{value}</span>
    </div>
  );
}

/* ─── Stat Tile ─────────────────────────────────────────────────────────── */
function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[var(--color-primary-dark)] opacity-70">{icon}</span>
        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-300">{label}</span>
      </div>
      <span className="text-xs font-semibold text-gray-700 leading-snug block">{value}</span>
    </div>
  );
}

/* ─── Call Card (accordion row) ─────────────────────────────────────────── */
function CallCard({ call, index }: { call: CallReport; index: number }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "transcript">("details");
  const answered = call.callStatus === "Call Answered";
  const isInbound = call.callDirection?.toLowerCase().includes("inbound");
  const displayName = call.customerName || call.calledTo || call.normalizedPhone || "Unknown";

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden ${
        open
          ? "border-[var(--color-primary-lighter)] shadow-md"
          : "border-gray-100 shadow-sm hover:border-[var(--color-primary-lighter)] hover:shadow"
      }`}
    >
      {/* ── Collapsed Row ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        {/* Status dot */}
        <span
          className={`shrink-0 w-2 h-2 rounded-full mt-px ${answered ? "bg-emerald-400" : "bg-rose-400"}`}
        />

        {/* Direction icon */}
        <span
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm ${
            isInbound ? "bg-[var(--color-primary-dark)]" : "bg-slate-400"
          }`}
          title={call.callDirection}
        >
          {isInbound ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </span>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-gray-800 truncate">{displayName}</span>
            {call.customerName && (
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">{call.normalizedPhone}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-400">{fmtShortDate(call.startTime)}</span>
            <span className="text-gray-200">·</span>
            <span className="text-[11px] text-gray-400">{call.callDuration}s</span>
          </div>
        </div>

        {/* Right chips */}
        <div className="flex items-center gap-2 shrink-0">
          <SentimentChip value={call.sentiment} />

          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              answered
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-500 border-rose-100"
            }`}
          >
            {answered ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {call.callStatus}
          </span>

          <span className="text-xs font-bold text-[var(--color-primary-dark)]">₹{call.totalCallCost}</span>

          <svg
            className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── Expanded Panel ── */}
      {open && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b border-gray-100 pb-2">
            {(["details", "transcript"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-[var(--color-primary-lighter)]/40 text-[var(--color-primary-darker)]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t}
                {t === "transcript" && !call.transcript && (
                  <span className="ml-1 text-[9px] text-gray-300">(none)</span>
                )}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="space-y-3">
              {/* Time grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatTile
                  label="Start Time"
                  value={fmtDate(call.startTime)}
                  icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>}
                />
                <StatTile
                  label="End Time"
                  value={fmtDate(call.endTime)}
                  icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>}
                />
                <StatTile
                  label="Duration"
                  value={`${call.callDuration}s`}
                  icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <StatTile
                  label="Direction"
                  value={call.callDirection}
                  icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>}
                />
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 py-1">
                {call.customerName && (
                  <InfoPill
                    icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                    label="Customer"
                    value={call.customerName}
                  />
                )}
                {call.normalizedPhone && (
                  <InfoPill
                    icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
                    label="Phone"
                    value={call.normalizedPhone}
                  />
                )}
                {call.participantIdentity && (
                  <InfoPill
                    icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg>}
                    label="Participant"
                    value={call.participantIdentity}
                  />
                )}
                {call.agentId && (
                  <InfoPill
                    icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                    label="Agent"
                    value={call.agentId}
                  />
                )}
                <InfoPill
                  icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  label="Cost"
                  value={`₹${call.totalCallCost}`}
                />
              </div>

              {/* Summary */}
              {call.summary && (
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-gray-300 mb-1">Summary</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{call.summary}</p>
                </div>
              )}

              {/* Recording */}
              {call.recordingUrl && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-gray-300 mb-1.5">Recording</p>
                  <AudioPlayer src={call.recordingUrl} />
                  <a
                    href={call.recordingUrl}
                    download
                    target="_blank"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary-darker)] hover:underline underline-offset-2 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Recording
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === "transcript" && (
            <div className="bg-gray-50 rounded-lg px-3 py-3 max-h-56 overflow-y-auto">
              {call.transcript ? (
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono">
                  {call.transcript}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-6">No transcript available</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CallReportPage() {
  const [calls, setCalls] = useState<CallReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      const res = await getCallReport();
      if (res?.data) setCalls(res.data);
      setLoading(false);
    };
    fetchCalls();
  }, []);

  if (loading) {
    return (
      <div className="p-5 space-y-2">
        <div className="h-5 w-36 rounded bg-gray-100 animate-pulse mb-4" />
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-gray-50 animate-pulse border border-gray-100"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  const answered = calls.filter((c) => c.callStatus === "Call Answered").length;
  const missed = calls.length - answered;

  return (
    <div className="p-5 sm:p-6 min-h-screen bg-white rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary-darker)] leading-tight tracking-tight">
            Call Reports
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{calls.length} total records</p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div>
            <p className="text-base font-bold text-emerald-600 leading-none">{answered}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Answered</p>
          </div>
          <div className="w-px h-7 bg-gray-100" />
          <div>
            <p className="text-base font-bold text-rose-500 leading-none">{missed}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Missed</p>
          </div>
          <div className="w-px h-7 bg-gray-100" />
          <div>
            <p className="text-base font-bold text-[var(--color-primary-darker)] leading-none">{calls.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Column hint */}
      {calls.length > 0 && (
        <div className="flex items-center px-4 mb-1.5 gap-3">
          <div className="w-2 shrink-0" />
          <div className="w-7 shrink-0" />
          <span className="flex-1 text-[9px] uppercase tracking-widest font-bold text-gray-300 pl-3">Caller</span>
          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-300 pr-8 hidden sm:block">Sentiment · Status · Cost</span>
        </div>
      )}

      {/* List */}
      {calls.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <svg className="w-10 h-10 mx-auto mb-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-sm">No call reports found</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {calls.map((call, i) => (
            <CallCard key={call.id} call={call} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}