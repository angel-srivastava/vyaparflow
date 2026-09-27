'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useReducer, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, AudioLines, BarChart3, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, Clock3, Copy, Download,
  Ellipsis, FileText, Filter, LayoutGrid, List, MessageCircle, Mic, MoreHorizontal, Package,
  Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Store, Target, TrendingUp, Users, Wallet,
  X, Zap,
} from 'lucide-react'

type Status = 'Pending' | 'In Progress' | 'Completed'
type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'
type Member = { id: string; name: string; role: string; color: string }
type Task = { id: string; title: string; note: string; assigneeId: string; deadline: string; priority: Priority; status: Status; amount: number; createdAt: string }
type Workspace = { members: Member[]; tasks: Task[] }

const TODAY = '2026-09-27'
const STORAGE_KEY = 'vyaparflow-workspaces-v1'

const personas = [
  {
    id: 'apex',
    name: 'Apex Kirana & FMCG Wholesale',
    short: 'Apex Store',
    category: 'WHOLESALE · KIRANA',
    location: 'Mumbai, Maharashtra',
    initials: 'AK',
    color: 'from-emerald-500 to-teal-400',
    accent: 'emerald',
    themeColor: '#10B981',
    badgeTheme: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    liquidityGlow: 'animate-[neon-pulse-emerald_3s_ease-in-out_infinite] border-emerald-400/50 bg-emerald-500/10 text-emerald-200',
    bgBase: 'bg-slate-950',
    accentGrad: 'from-emerald-500 via-teal-400 to-lime-300',
  },
  {
    id: 'speedtech',
    name: 'SpeedTech Auto Workshop',
    short: 'SpeedTech',
    category: 'AUTOMOTIVE · SERVICE',
    location: 'Pune, Maharashtra',
    initials: 'ST',
    color: 'from-amber-500 to-orange-500',
    accent: 'amber',
    themeColor: '#F59E0B',
    badgeTheme: 'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    liquidityGlow: 'animate-[neon-pulse-amber_3s_ease-in-out_infinite] border-amber-400/50 bg-amber-500/10 text-amber-200',
    bgBase: 'bg-zinc-950',
    accentGrad: 'from-amber-400 via-orange-500 to-yellow-300',
  },
  {
    id: 'metro',
    name: 'Metro Express Logistics Hub',
    short: 'Metro Express',
    category: 'LOGISTICS · DELIVERY',
    location: 'Bengaluru, Karnataka',
    initials: 'ME',
    color: 'from-indigo-500 to-cyan-400',
    accent: 'cyan',
    themeColor: '#06B6D4',
    badgeTheme: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    liquidityGlow: 'animate-[neon-pulse-cyan_3s_ease-in-out_infinite] border-cyan-400/50 bg-cyan-500/10 text-cyan-200',
    bgBase: 'bg-[#070b14]',
    accentGrad: 'from-cyan-400 via-indigo-500 to-teal-300',
  },
]

const people = (items: [string, string, string][]): Member[] => items.map(([name, role, color], i) => ({ id: `member-${i + 1}`, name, role, color }))
const makeTask = (id: string, title: string, note: string, assigneeId: string, deadline: string, priority: Priority, status: Status, amount = 0): Task => ({ id, title, note, assigneeId, deadline, priority, status, amount, createdAt: TODAY })

const seed: Record<string, Workspace> = {
  apex: {
    members: people([
      ['Amit Sharma', 'Procurement', 'bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/30'],
      ['Suresh Patel', 'Logistics', 'bg-amber-950/80 text-amber-300 ring-1 ring-amber-500/30'],
      ['Rohit Verma', 'Delivery', 'bg-sky-950/80 text-sky-300 ring-1 ring-sky-500/30'],
      ['Priya Nair', 'Cash Counter', 'bg-rose-950/80 text-rose-300 ring-1 ring-rose-500/30'],
    ]),
    tasks: [
      makeTask('a1', 'Clear ₹12,000 packaging invoice with Sharma Containers', 'Confirm the invoice against received cartons before payment.', 'member-1', '2026-09-25', 'Urgent', 'Pending', 12000),
      makeTask('a2', 'Inspect morning dairy crates and verify return crates', 'Check seal integrity and reconcile returnable crates.', 'member-2', '2026-09-26', 'High', 'In Progress'),
      makeTask('a3', 'Restock bulk wheat flour sacks from central mill', 'Coordinate stock availability with the central mill.', 'member-2', '2026-09-28', 'Medium', 'Pending', 6500),
      makeTask('a4', 'Deliver wholesale spice orders to restaurant hub', 'Three restaurant orders; collect signatures on delivery.', 'member-3', '2026-09-29', 'High', 'In Progress'),
      makeTask('a5', 'Verify cash drawer balance and tally slips', "Match counter cash to today's closing slips.", 'member-4', TODAY, 'Low', 'Completed'),
    ],
  },
  speedtech: {
    members: people([
      ['Arjun Mehta', 'Service Lead', 'bg-amber-950/80 text-amber-300 ring-1 ring-amber-500/30'],
      ['Kavita Rao', 'Parts & Inventory', 'bg-orange-950/80 text-orange-300 ring-1 ring-orange-500/30'],
      ['Manoj Singh', 'Technician', 'bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-500/30'],
      ['Neha Kulkarni', 'Front Desk', 'bg-rose-950/80 text-rose-300 ring-1 ring-rose-500/30'],
    ]),
    tasks: [
      makeTask('s1', 'Replace brake pads on MH12 AB 4821', 'Customer pickup scheduled this afternoon.', 'member-3', '2026-09-27', 'Urgent', 'In Progress', 4800),
      makeTask('s2', 'Reconcile pending Bosch parts invoice', 'Confirm received filters and spark plugs before settlement.', 'member-2', '2026-09-26', 'High', 'Pending', 8600),
      makeTask('s3', 'Complete oil change and 20-point inspection', 'Service bay two; update vehicle service history.', 'member-3', '2026-09-28', 'Medium', 'Pending', 3200),
      makeTask('s4', 'Call back customers for service approvals', 'Follow up on the three open repair estimates.', 'member-4', '2026-09-28', 'Low', 'In Progress'),
      makeTask('s5', "Close yesterday's workshop job cards", 'File signed customer approvals.', 'member-1', '2026-09-27', 'Medium', 'Completed'),
    ],
  },
  metro: {
    members: people([
      ['Vikram Das', 'Fleet Manager', 'bg-indigo-950/80 text-indigo-300 ring-1 ring-indigo-500/30'],
      ['Ananya Iyer', 'Dispatch', 'bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-500/30'],
      ['Ramesh Yadav', 'Driver Lead', 'bg-teal-950/80 text-teal-300 ring-1 ring-teal-500/30'],
      ['Farah Khan', 'Accounts', 'bg-rose-950/80 text-rose-300 ring-1 ring-rose-500/30'],
    ]),
    tasks: [
      makeTask('m1', 'Settle diesel advance with Ramesh Yadav', 'Match fuel slips to vehicle route logs.', 'member-4', '2026-09-25', 'Urgent', 'Pending', 9500),
      makeTask('m2', 'Resolve delayed Whitefield B2B shipment', 'Confirm revised delivery window with client.', 'member-2', '2026-09-26', 'High', 'In Progress'),
      makeTask('m3', 'Schedule routine maintenance for van KA 03 9214', 'Book the vehicle into the partner service bay.', 'member-1', '2026-09-28', 'Medium', 'Pending', 7400),
      makeTask('m4', "Reconcile PODs for yesterday's final-mile routes", 'Collect missing proof-of-delivery photos from drivers.', 'member-3', '2026-09-29', 'High', 'In Progress'),
      makeTask('m5', 'Publish the morning fleet dispatch plan', 'Share route assignments with the driver group.', 'member-2', TODAY, 'Low', 'Completed'),
    ],
  },
}

type Action = { type: 'replace'; workspace: Workspace } | { type: 'task'; task: Task } | { type: 'status'; id: string; status: Status } | { type: 'escalate' } | { type: 'member'; member: Member }
function reducer(state: Workspace, action: Action): Workspace {
  if (action.type === 'replace') return action.workspace
  if (action.type === 'task') return { ...state, tasks: [action.task, ...state.tasks] }
  if (action.type === 'member') return { ...state, members: [...state.members, action.member] }
  if (action.type === 'escalate') return { ...state, tasks: state.tasks.map(t => t.status !== 'Completed' && t.deadline < TODAY ? { ...t, priority: 'Urgent' } : t) }
  return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: action.status } : t) }
}

const currency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const initials = (name: string) => name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
const newId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`

export default function Page() {
  const [personaId, setPersonaId] = useState('apex')
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(seed)
  const [hydrated, setHydrated] = useState(false)
  const [state, dispatch] = useReducer(reducer, seed.apex)
  const [tab, setTab] = useState<'board' | 'team' | 'analytics'>('board')
  const [layout, setLayout] = useState<'kanban' | 'list'>('kanban')
  const [personaOpen, setPersonaOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [modal, setModal] = useState<'task' | 'digest' | null>(null)
  const [ambient, setAmbient] = useState('')
  const [listening, setListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [employeeRole, setEmployeeRole] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { personaId?: string; workspaces?: Record<string, Workspace> }
        if (parsed.workspaces) setWorkspaces({ ...seed, ...parsed.workspaces })
        if (parsed.personaId && seed[parsed.personaId]) setPersonaId(parsed.personaId)
        dispatch({ type: 'replace', workspace: parsed.workspaces?.[parsed.personaId || 'apex'] || seed[parsed.personaId || 'apex'] || seed.apex })
      }
    } catch { /* Ignore demo state parse error */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ personaId, workspaces: { ...workspaces, [personaId]: state } }))
  }, [hydrated, personaId, state, workspaces])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const persona = personas.find(p => p.id === personaId) || personas[0]
  const membersById = useMemo(() => Object.fromEntries(state.members.map(member => [member.id, member])), [state.members])
  const overdue = state.tasks.filter(t => t.status !== 'Completed' && t.deadline < TODAY)
  const active = state.tasks.filter(t => t.status !== 'Completed')
  const completed = state.tasks.filter(t => t.status === 'Completed')
  const pendingOutflow = active.reduce((sum, t) => sum + t.amount, 0)
  const productivity = state.tasks.length ? Math.round(completed.length / state.tasks.length * 100) : 0

  const filtered = state.tasks.filter(task => {
    const member = membersById[task.assigneeId]
    const text = `${task.title} ${task.note} ${member?.name || ''} ${member?.role || ''}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (assigneeFilter === 'all' || task.assigneeId === assigneeFilter) && (priorityFilter === 'all' || task.priority === priorityFilter) && (!overdueOnly || (task.status !== 'Completed' && task.deadline < TODAY))
  })

  const switchPersona = (id: string) => {
    if (id === personaId) { setPersonaOpen(false); return }
    setWorkspaces(current => ({ ...current, [personaId]: state }))
    const next = workspaces[id] || seed[id]
    dispatch({ type: 'replace', workspace: next })
    setPersonaId(id)
    setPersonaOpen(false)
    setSearch('')
    setAssigneeFilter('all')
    setPriorityFilter('all')
    setOverdueOnly(false)
    setToast(`Switched to ${personas.find(p => p.id === id)?.short}`)
  }

  const addTask = (details: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'task', task: { ...details, id: newId(), createdAt: TODAY } })
    setModal(null)
    setToast('Task added to your operations board')
  }

  const setStatus = (id: string, status: Status) => dispatch({ type: 'status', id, status })

  const addAmbientTask = () => {
    const raw = ambient.trim()
    if (!raw) return
    const amountMatch = raw.match(/(?:₹|rs\.?\s*)\s*([\d,]+)|\b([\d,]+)\s*(?:rupees?)\b/i)
    const bareAmount = amountMatch ? null : raw.match(/(?<![\d/-])([\d,]+)(?![\d/-])/)
    const amount = Number((amountMatch?.[1] || amountMatch?.[2] || bareAmount?.[1] || '0').replaceAll(',', ''))
    const assignee = state.members.find(member => raw.toLowerCase().includes(member.name.toLowerCase()))
    const date = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/)
    let deadline = date?.[1] || '2026-09-28'
    const lower = raw.toLowerCase()
    if (lower.includes('today')) deadline = TODAY
    if (lower.includes('tomorrow')) deadline = '2026-09-28'
    if (lower.includes('friday')) deadline = '2026-10-02'
    const titleSource = bareAmount ? raw.replace(bareAmount[1], '') : raw
    const title = titleSource.replace(/(?:₹|rs\.?\s*)\s*[\d,]+|\b[\d,]+\s*(?:rupees?)\b|\b\d{4}-\d{2}-\d{2}\b/ig, '').replace(/\b(?:by\s+)?(?:today|tomorrow|friday)\b|\b(?:urgent|high priority)\b/ig, '').replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '')
    addTask({ title: title || raw, note: 'Captured with Ambient Task Capture', assigneeId: assignee?.id || state.members[0]?.id || '', deadline, priority: /urgent/i.test(raw) ? 'Urgent' : /high priority/i.test(raw) ? 'High' : 'Medium', status: 'Pending', amount })
    setAmbient('')
  }

  const startSpeech = () => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => { lang: string; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void }; webkitSpeechRecognition?: new () => { lang: string; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void } }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: new () => { lang: string; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void } }).webkitSpeechRecognition
    if (!SpeechRecognition) { setListening(true); setToast('Voice input is not available in this browser'); window.setTimeout(() => setListening(false), 1700); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.onresult = event => setAmbient(current => `${current} ${event.results[0][0].transcript}`.trim())
    recognition.onend = () => setListening(false)
    setListening(true); recognition.start()
  }

  const digestText = `VyaparFlow · End of day | ${persona.short}\n\nCompleted today\n${completed.length ? completed.map(t => `• ${t.title}`).join('\n') : '• No tasks completed yet'}\n\nCarried over / overdue\n${active.length ? active.map(t => `• ${t.title}${t.deadline < TODAY ? ' (OVERDUE)' : ''}`).join('\n') : '• Nothing carried over'}\n\nPending outflow for tomorrow: ${currency(active.filter(t => t.deadline <= '2026-09-28').reduce((sum, t) => sum + t.amount, 0))}`
  const copyDigest = async () => { try { await navigator.clipboard.writeText(digestText); setCopied(true); setToast('Digest copied to clipboard'); window.setTimeout(() => setCopied(false), 2200) } catch { setToast('Clipboard access is unavailable') } }

  return (
    <main className={`relative min-h-screen ${persona.bgBase} pb-44 text-slate-100 transition-colors duration-700 selection:bg-indigo-500/40 selection:text-white overflow-hidden`}>
      {/* 1. DIVERGENT CATEGORY THEMES & DYNAMIC BACKGROUNDS */}
      <AtmosphericBackground personaId={persona.id} />

      {/* Luxury Frosted Glass Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-2xl transition-colors duration-500">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-1 ring-white/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-[15px] font-black tracking-tight text-transparent sm:text-[17px]">
                  VyaparFlow
                </span>
                <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300 sm:inline-flex">
                  MSME OPS ENGINE
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-400 sm:block">Your business, in rhythm.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setPersonaOpen(v => !v)}
                className="flex max-w-[160px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] sm:max-w-[250px] sm:px-3"
                aria-expanded={personaOpen}
                aria-label="Switch store persona"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${persona.color} text-[10px] font-extrabold text-white shadow-md`}>
                  {persona.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-white">{persona.short}</span>
                  <span className="hidden text-[10px] text-slate-400 sm:block">Guest Store Manager</span>
                </span>
                <ChevronDown size={14} className="shrink-0 text-slate-400" />
              </button>

              <AnimatePresence>
                {personaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[310px] rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active Business
                    </div>
                    {personas.map(item => (
                      <button
                        key={item.id}
                        onClick={() => switchPersona(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                          personaId === item.id ? 'border border-white/10 bg-white/[0.09] shadow-inner' : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-[10px] font-bold text-white shadow-sm`}>
                          {item.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-white">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </span>
                        {personaId === item.id && <Check size={16} className="text-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden items-center gap-2 border-l border-white/10 pl-3 lg:flex">
              <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-indigo-300">
                <span className="text-xs font-bold">G</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Guest Admin</p>
                <p className="text-[10px] text-slate-400">{persona.short}</p>
              </div>
            </div>

            <button
              onClick={() => setModal('digest')}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] md:flex"
            >
              <FileText size={15} className="text-indigo-400" /> Generate EOD Digest
            </button>

            <button
              onClick={() => setModal('task')}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:brightness-110 active:scale-95 sm:px-4"
            >
              <Plus size={16} /> <span className="hidden sm:inline">New Task</span><span className="sm:hidden">Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <section className="flex flex-wrap items-center justify-between gap-3 py-5 sm:py-7">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-bold text-slate-200 shadow-lg backdrop-blur-xl">
                <span className="size-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818CF8]" />
                <span>LIVE WORKSPACE</span>
                <span className="text-slate-500">/</span>
                <span className="font-semibold text-indigo-300">{persona.category}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-xl">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                </span>
                <span>SYNC ENGINE ACTIVE</span>
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-[32px]">
              Good morning, Guest Admin <span className="inline-block">👋</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here's what's moving at <span className="font-semibold text-slate-200">{persona.name}</span> today.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 shadow-md backdrop-blur-xl">
            <CalendarDays size={15} className="text-indigo-400" /> Sunday, September 27, 2026
          </div>
        </section>

        {/* 2. FROSTED GLASSMORPHISM METRIC BENTO PILLS */}
        <section aria-label="Operational metrics" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:sticky lg:top-[68px] lg:z-20 lg:grid-cols-6 lg:bg-slate-950/80 lg:py-3 lg:backdrop-blur-2xl">
          <Metric label="Total ops tasks" value={state.tasks.length} icon={<Target size={15} />} tone="slate" foot="Across all workflows" />
          <Metric label="Active WIP" value={active.length} icon={<Activity size={15} />} tone="amber" foot="Needs attention" />
          <Metric label="Completed" value={completed.length} icon={<CheckCircle2 size={15} />} tone="emerald" foot="Closed out today" />
          <Metric label="Overdue & blocked" value={overdue.length} icon={<AlertTriangle size={15} />} tone="rose" foot={overdue.length ? 'Immediate triage' : 'All on track'} alert={overdue.length > 0} />
          <Metric label="Productivity score" value={`${productivity}%`} icon={<TrendingUp size={15} />} tone="indigo" foot="Completion rate" />
          <Metric
            label="Pending cash outflow"
            value={currency(pendingOutflow)}
            icon={<Wallet size={15} />}
            tone="amber"
            foot="On incomplete tasks"
            compact
            badge="Active Liability"
            isLiquidity
            liquidityGlow={persona.liquidityGlow}
          />
        </section>

        {/* Navigation Tabs */}
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/[0.08] sm:flex-row sm:items-center">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Main views">
            {([['board', 'Daily Operations'], ['team', 'Team Directory'], ['analytics', 'Productivity']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition sm:px-4 ${
                  tab === key
                    ? 'border-indigo-400 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {key === 'board' ? <LayoutGrid size={15} /> : key === 'team' ? <Users size={15} /> : <BarChart3 size={15} />}
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 pb-3 sm:pb-2">
            <span className="mr-1 hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 md:inline">
              Workspace
            </span>
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 backdrop-blur-xl">
              <button
                onClick={() => setLayout('kanban')}
                aria-label="Kanban view"
                className={`rounded-md p-1.5 transition ${layout === 'kanban' ? 'bg-indigo-600/40 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setLayout('list')}
                aria-label="List view"
                className={`rounded-md p-1.5 transition ${layout === 'list' ? 'bg-indigo-600/40 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <List size={15} />
              </button>
            </div>
            <button aria-label="Workspace settings" className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-400 backdrop-blur-xl hover:bg-white/[0.07] hover:text-white">
              <Settings2 size={15} />
            </button>
          </div>
        </div>

        {tab === 'board' && (
          <>
            {/* 3. URGENT / OVERDUE RADAR WITH PULSING CRIMSON NEON PERIMETER */}
            {overdue.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-2xl animate-[perimeter-glow_3s_ease-in-out_infinite] sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <AlertTriangle size={20} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      Overdue triage radar
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(225,29,72,0.6)]">
                        {overdue.length} tasks
                      </span>
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-rose-200/80">
                      {overdue.length} operational tasks require immediate intervention! Unresolved supplier payments and delivery delays.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { dispatch({ type: 'escalate' }); setToast('All overdue tasks escalated to urgent') }}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition hover:brightness-110 active:scale-95"
                >
                  Escalate all overdue <ArrowUpRight size={14} className="ml-1 inline" />
                </button>
              </motion.section>
            )}

            {/* Frosted Search & Filters */}
            <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:flex-row sm:items-center sm:p-3.5">
              <label className="relative min-w-0 flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search task, staff, or vendor..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/80 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter by assignee"
                  value={assigneeFilter}
                  onChange={e => setAssigneeFilter(e.target.value)}
                  className="h-10 min-w-[120px] flex-1 rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs text-slate-200 outline-none focus:border-indigo-400 sm:flex-none"
                >
                  <option value="all">All assignees</option>
                  {state.members.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">{m.name}</option>
                  ))}
                </select>

                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="h-10 min-w-[112px] flex-1 rounded-xl border border-white/10 bg-slate-900/90 px-3 text-xs text-slate-200 outline-none focus:border-indigo-400 sm:flex-none"
                >
                  <option value="all">All priorities</option>
                  {(['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map(p => (
                    <option key={p} value={p} className="bg-slate-900 text-white">{p} priority</option>
                  ))}
                </select>

                <button
                  onClick={() => setOverdueOnly(v => !v)}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
                    overdueOnly
                      ? 'border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                      : 'border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Filter size={14} /> <span>Overdue only</span>
                  <span className={`relative h-4 w-7 rounded-full transition ${overdueOnly ? 'bg-rose-500' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${overdueOnly ? 'left-3.5' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>
            </section>

            {/* Kanban or List Board */}
            {layout === 'kanban' ? (
              <div className="grid items-start gap-4 lg:grid-cols-3">
                {(['Pending', 'In Progress', 'Completed'] as Status[]).map(status => {
                  const items = filtered.filter(t => t.status === status)
                  return (
                    <section key={status} className="min-w-0">
                      <div className="mb-3 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2.5 rounded-full ${
                              status === 'Pending'
                                ? 'bg-slate-400 shadow-[0_0_8px_#94A3B8]'
                                : status === 'In Progress'
                                ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24]'
                                : 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                            }`}
                          />
                          <h2 className="text-sm font-bold text-white">{status === 'Pending' ? 'To do' : status}</h2>
                          <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                            {items.length}
                          </span>
                        </div>
                        <button aria-label={`More ${status} options`} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                          <MoreHorizontal size={17} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {items.map(task => (
                          <TaskCard key={task.id} task={task} member={membersById[task.assigneeId]} onStatus={setStatus} />
                        ))}
                        {items.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-xs text-slate-500 backdrop-blur-xl">
                            No tasks in this column
                          </div>
                        )}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : (
              <TaskTable tasks={filtered} members={membersById} onStatus={setStatus} />
            )}

            <div className="mt-5 flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Showing {filtered.length} of {state.tasks.length} operational tasks</span>
              <span className="hidden sm:inline">
                Last synced just now <span className="ml-1 inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              </span>
            </div>
          </>
        )}

        {tab === 'team' && <TeamView state={state} dispatch={dispatch} name={employeeName} role={employeeRole} setName={setEmployeeName} setRole={setEmployeeRole} />}
        {tab === 'analytics' && <AnalyticsView state={state} />}
      </div>

      {/* 3. FLOATING COMMAND DOCK (BOTTOM VOICE & TEXT BAR) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-3 sm:bottom-6 sm:px-6">
        <div className="pointer-events-auto mx-auto max-w-[920px] rounded-2xl border border-white/[0.12] bg-white/[0.06] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-300 hover:border-white/[0.22] sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Voice Mic Button with animated ripple sonar ring when active or hovered */}
            <div className="group relative">
              <span className={`pointer-events-none absolute inset-0 rounded-xl bg-indigo-500/40 transition-opacity duration-300 ${listening ? 'bg-rose-500/50 opacity-100 animate-[sonar-ring_2s_cubic-bezier(0,0,0.2,1)_infinite]' : 'opacity-0 group-hover:opacity-100 group-hover:animate-[sonar-ring_2s_cubic-bezier(0,0,0.2,1)_infinite]'}`} />
              <button
                onClick={startSpeech}
                aria-label={listening ? 'Stop voice capture' : 'Start voice capture'}
                className={`relative flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-200 active:scale-95 ${
                  listening
                    ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                    : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110'
                }`}
              >
                {listening ? <AudioLines size={19} className="relative animate-pulse" /> : <Mic size={19} />}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative">
                <input
                  value={ambient}
                  onChange={e => setAmbient(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addAmbientTask()
                  }}
                  placeholder="Say or type: 'Pay ₹4,500 to Ramesh by Friday for dairy crate'..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-3 pr-10 text-xs text-white outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-indigo-400/80 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                />
                <button
                  onClick={addAmbientTask}
                  aria-label="Capture task"
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-950/60 transition hover:bg-indigo-500 active:scale-95"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">
                Quick capture <span className="text-slate-600">·</span> Natural language parser with currency & deadline detection
              </p>
            </div>

            <button
              onClick={() => setModal('task')}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 shadow-sm backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white active:scale-95 sm:hidden"
              aria-label="Open full task form"
            >
              <Plus size={19} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {modal === 'task' && <TaskModal members={state.members} onClose={() => setModal(null)} onSubmit={addTask} />}
        {modal === 'digest' && <DigestModal text={digestText} tasks={state.tasks} members={membersById} onClose={() => setModal(null)} onCopy={copyDigest} copied={copied} />}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-white/15 bg-slate-900/95 px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* 1. DIVERGENT CATEGORY THEMED BACKGROUNDS COMPONENT */
function AtmosphericBackground({ personaId }: { personaId: string }) {
  if (personaId === 'apex') {
    // Apex Kirana & FMCG Wholesale: Deep emerald/forest obsidian with floating organic grains/spices
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Ambient Emerald & Lime blurred radial glows */}
        <div className="absolute -left-20 -top-20 size-[500px] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-10 top-1/3 size-[450px] rounded-full bg-teal-500/12 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-[500px] rounded-full bg-lime-400/10 blur-3xl" />
        
        {/* Floating translucent organic grains and spice particles using keyframe drift */}
        {[
          { top: '15%', left: '10%', delay: '0s', size: 14, rot: 'rotate(12deg)' },
          { top: '25%', left: '85%', delay: '1.2s', size: 18, rot: 'rotate(45deg)' },
          { top: '45%', left: '20%', delay: '2.5s', size: 12, rot: 'rotate(-20deg)' },
          { top: '65%', left: '75%', delay: '0.8s', size: 20, rot: 'rotate(30deg)' },
          { top: '80%', left: '30%', delay: '3.2s', size: 15, rot: 'rotate(-15deg)' },
          { top: '35%', left: '55%', delay: '4s', size: 16, rot: 'rotate(60deg)' },
          { top: '85%', left: '88%', delay: '1.8s', size: 13, rot: 'rotate(25deg)' },
          { top: '10%', left: '60%', delay: '2.8s', size: 17, rot: 'rotate(-35deg)' },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute text-emerald-400/30"
            style={{
              top: p.top,
              left: p.left,
              animation: `float-drift 7s ease-in-out infinite ${p.delay}`,
            }}
          >
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor" style={{ transform: p.rot }}>
              {/* Organic grain / spice teardrop silhouette */}
              <path d="M12 2C8 6 5 12 7 17C8.5 20.5 12 22 14 20C17 17 19 10 12 2Z" opacity="0.6" />
            </svg>
          </div>
        ))}
      </div>
    )
  }

  if (personaId === 'speedtech') {
    // SpeedTech Auto Workshop: Dark carbon-titanium industrial with animated metallic grid & sparks
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Metallic Grid Overlay */}
        <div className="metallic-grid absolute inset-0 opacity-40" />

        {/* Ambient Spark & Pulse Radial Blurs */}
        <div className="absolute -top-20 right-1/4 size-[480px] rounded-full bg-amber-500/18 blur-3xl animate-[spark-pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-8 size-[420px] rounded-full bg-orange-500/14 blur-3xl animate-[spark-pulse_5s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-10 right-12 size-[360px] rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Faint Mechanical Gear Silhouettes */}
        <div className="absolute -right-24 -top-24 opacity-[0.05] text-amber-200 animate-[spin_50s_linear_infinite]">
          <svg width="420" height="420" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>

        <div className="absolute -left-20 bottom-10 opacity-[0.04] text-orange-200 animate-[spin_60s_linear_infinite_reverse]">
          <svg width="340" height="340" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
      </div>
    )
  }

  // Metro Express Logistics Hub: Deep cyber-navy midnight with transit arcs & radar sweep
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Cyber-navy radial glows */}
      <div className="absolute -left-20 top-0 size-[520px] rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute right-0 top-1/4 size-[480px] rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-[500px] rounded-full bg-teal-400/10 blur-3xl" />

      {/* Radar sweep conic background */}
      <div className="radar-sweep-conic absolute left-1/2 top-1/3 size-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-xl animate-[radar-sweep_10s_linear_infinite]" />

      {/* Pulsating logistics transit nodes and glowing SVG route arcs */}
      <svg className="absolute inset-0 size-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        <path d="M 120 200 Q 400 120 720 260 T 1320 220" fill="none" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="8 8" className="animate-[transit-flow_5s_linear_infinite]" />
        <path d="M 180 520 Q 560 380 920 480 T 1400 420" fill="none" stroke="url(#routeGrad)" strokeWidth="1.5" strokeDasharray="6 6" className="animate-[transit-flow_4s_linear_infinite]" />

        {/* Transit Nodes */}
        <circle cx="120" cy="200" r="5" fill="#38BDF8" className="animate-pulse" />
        <circle cx="720" cy="260" r="6" fill="#818CF8" className="animate-pulse" />
        <circle cx="1320" cy="220" r="5" fill="#34D399" className="animate-pulse" />
        <circle cx="560" cy="380" r="4" fill="#38BDF8" />
        <circle cx="920" cy="480" r="5" fill="#2DD4BF" className="animate-pulse" />
      </svg>
    </div>
  )
}

/* 2. FROSTED GLASS BENTO PILL METRIC CARD */
function Metric({
  label,
  value,
  icon,
  tone,
  foot,
  alert = false,
  compact = false,
  badge,
  isLiquidity = false,
  liquidityGlow = '',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone: string
  foot: string
  alert?: boolean
  compact?: boolean
  badge?: string
  isLiquidity?: boolean
  liquidityGlow?: string
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-800/80 text-slate-300 ring-1 ring-white/10 shadow-inner',
    amber: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    emerald: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    rose: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    indigo: 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  }

  const cardStyling = isLiquidity
    ? `${liquidityGlow || 'animate-[neon-pulse-amber_3s_ease-in-out_infinite] border-amber-400/50 bg-amber-500/10'} shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]`
    : alert
    ? 'border-rose-500/40 bg-rose-950/20 shadow-[0_8px_32px_0_rgba(244,63,94,0.25)] ring-1 ring-rose-500/20'
    : 'border-white/[0.08] bg-white/[0.04] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/[0.18]'

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent ${cardStyling}`}
    >
      <div className="relative z-10 mb-3 flex items-center justify-between gap-1.5">
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-amber-400/50 bg-amber-400/20 px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wide text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              {badge}
            </span>
          )}
          <span className={`flex size-7 items-center justify-center rounded-lg ${tones[tone]}`}>
            {icon}
          </span>
        </div>
      </div>

      <div
        className={`relative z-10 truncate font-black tracking-tight ${compact ? 'text-[17px] sm:text-lg' : 'text-2xl'} ${
          isLiquidity
            ? 'bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-black'
            : tone === 'amber'
            ? 'text-amber-300'
            : tone === 'emerald'
            ? 'text-emerald-300'
            : tone === 'rose'
            ? 'text-rose-400'
            : tone === 'indigo'
            ? 'text-indigo-300'
            : 'text-white'
        }`}
      >
        {alert && <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E] align-middle" />}
        {value}
      </div>

      <p className={`relative z-10 mt-1 truncate text-[10px] ${isLiquidity ? 'font-semibold text-amber-300/90' : 'text-slate-400'}`}>
        {foot}
      </p>
    </div>
  )
}

/* 3. TASK CARD WITH RICH MICRO-INTERACTIONS & DIRECTIONAL LIGHTING */
function TaskCard({ task, member, onStatus }: { task: Task; member?: Member; onStatus: (id: string, status: Status) => void }) {
  const isOverdue = task.status !== 'Completed' && task.deadline < TODAY
  const priorityClass: Record<Priority, string> = {
    Low: 'border border-slate-700/60 bg-slate-800/60 text-slate-300',
    Medium: 'border border-blue-500/30 bg-blue-500/15 text-blue-300',
    High: 'border border-amber-500/30 bg-amber-500/15 text-amber-300',
    Urgent: 'border border-rose-500/40 bg-rose-500/20 text-rose-300 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]',
  }
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Hello ${member?.name || 'there'}, reminder from VyaparFlow: Task '${task.title}' is marked as ${task.priority} and is due on ${dateLabel(task.deadline)}. Please update status.`)}`

  return (
    <motion.article
      layout
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:border-white/[0.18] hover:shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent"
    >
      <div className="relative z-10 mb-2.5 flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-semibold leading-[1.5] text-slate-100 transition-colors group-hover:text-white">
          {task.title}
        </h3>
        <button
          aria-label="Task options"
          className="shrink-0 rounded-md p-0.5 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        >
          <Ellipsis size={17} />
        </button>
      </div>

      <p className="relative z-10 mb-3 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
        {task.note}
      </p>

      <div className="relative z-10 mb-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${priorityClass[task.priority]}`}>
          {task.priority === 'Urgent' ? 'URGENT' : task.priority}
        </span>
        {task.amount > 0 && (
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            {currency(task.amount)} outflow
          </span>
        )}
        {isOverdue && (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/50 bg-rose-600/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]">
            <AlertTriangle size={10} /> OVERDUE
          </span>
        )}
      </div>

      <div className="relative z-10 mb-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold shadow-inner ${member?.color || 'bg-slate-800 text-slate-300'}`}>
            {member ? initials(member.name) : '?'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-slate-200">{member?.name || 'Unassigned'}</p>
            <p className="truncate text-[9px] text-slate-400">{member?.role || 'Team'}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
          <CalendarDays size={12} />
          {dateLabel(task.deadline)}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2">
        <select
          aria-label={`Change status for ${task.title}`}
          value={task.status}
          onChange={e => onStatus(task.id, e.target.value as Status)}
          className="min-w-0 rounded-lg border border-white/10 bg-slate-900/90 px-2 py-1.5 text-[10px] font-semibold text-slate-300 outline-none focus:border-indigo-400"
        >
          <option value="Pending" className="bg-slate-900 text-white">Pending</option>
          <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
          <option value="Completed" className="bg-slate-900 text-white">Completed</option>
        </select>

        {/* Vibrant WhatsApp Action Pill Button */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:brightness-110 active:scale-95"
        >
          <MessageCircle size={13} /> Ping on WhatsApp
        </a>
      </div>
    </motion.article>
  )
}

function TaskTable({ tasks, members, onStatus }: { tasks: Task[]; members: Record<string, Member>; onStatus: (id: string, status: Status) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3 font-bold">Task</th>
            <th className="px-4 py-3 font-bold">Assignee</th>
            <th className="px-4 py-3 font-bold">Priority</th>
            <th className="px-4 py-3 font-bold">Due date</th>
            <th className="px-4 py-3 font-bold">Outflow</th>
            <th className="px-4 py-3 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b border-white/[0.04] text-xs transition-colors hover:bg-white/[0.04]">
              <td className="max-w-[360px] px-4 py-3.5 font-semibold text-white">{task.title}</td>
              <td className="px-4 py-3.5 text-slate-300">{members[task.assigneeId]?.name || 'Unassigned'}</td>
              <td className="px-4 py-3.5">{task.priority}</td>
              <td className={`px-4 py-3.5 ${task.status !== 'Completed' && task.deadline < TODAY ? 'font-bold text-rose-400' : 'text-slate-400'}`}>
                {dateLabel(task.deadline)}
              </td>
              <td className="px-4 py-3.5 font-medium text-emerald-300">{task.amount ? currency(task.amount) : '—'}</td>
              <td className="px-4 py-3.5">
                <select
                  aria-label={`Change status for ${task.title}`}
                  value={task.status}
                  onChange={e => onStatus(task.id, e.target.value as Status)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-[10px] text-slate-200 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamView({ state, dispatch, name, role, setName, setRole }: { state: Workspace; dispatch: React.Dispatch<Action>; name: string; role: string; setName: (s: string) => void; setRole: (s: string) => void }) {
  const addMember = () => {
    if (!name.trim() || !role.trim()) return
    dispatch({ type: 'member', member: { id: newId(), name: name.trim(), role: role.trim(), color: 'bg-violet-950/80 text-violet-300 ring-1 ring-violet-500/30' } })
    setName('')
    setRole('')
  }

  return (
    <section className="pb-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Your people, at a glance</h2>
          <p className="mt-1 text-xs text-slate-400">See who's carrying what and keep the work balanced.</p>
        </div>
        <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {state.members.length} team members
        </span>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.members.map(member => {
          const assigned = state.tasks.filter(t => t.assigneeId === member.id)
          const active = assigned.filter(t => t.status !== 'Completed').length
          const done = assigned.length - active
          const status = active >= 4 ? 'Overloaded' : active >= 2 ? 'Balanced' : 'Available'
          const tone = status === 'Overloaded' ? 'border-rose-500/40 bg-rose-500/15 text-rose-300' : status === 'Balanced' ? 'border-amber-500/40 bg-amber-500/15 text-amber-300' : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'

          return (
            <article key={member.id} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex size-12 items-center justify-center rounded-2xl text-sm font-bold shadow-inner ${member.color}`}>
                    {initials(member.name)}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tone}`}>{status}</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-lg font-black text-white">{active}</p>
                    <p className="text-[10px] text-slate-400">Active tasks</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-emerald-400">{done}</p>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                </div>

                <div className="flex -space-x-2">
                  {assigned.slice(0, 3).map((task, i) => (
                    <span
                      key={task.id}
                      title={task.title}
                      className={`flex size-7 items-center justify-center rounded-full border border-slate-900 text-[9px] shadow-sm ${
                        i % 2 ? 'bg-amber-500/30 text-amber-300' : 'bg-indigo-500/30 text-indigo-300'
                      }`}
                    >
                      {task.status === 'Completed' ? <Check size={12} /> : <Circle size={10} />}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <form onSubmit={e => { e.preventDefault(); addMember() }} className="rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-950/20 p-4 backdrop-blur-2xl sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
            <Plus size={16} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white">Add someone to the team</h3>
            <p className="text-[10px] text-slate-400">Bring a new teammate into your daily operations.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Full name"
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none focus:border-indigo-400"
          />
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            placeholder="Department or role"
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none focus:border-indigo-400"
          />
          <button type="submit" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95">
            <Plus size={14} /> Add employee
          </button>
        </div>
      </form>
    </section>
  )
}

function AnalyticsView({ state }: { state: Workspace }) {
  const counts = (['Pending', 'In Progress', 'Completed'] as Status[]).map(status => ({ status, count: state.tasks.filter(t => t.status === status).length }))
  const total = Math.max(state.tasks.length, 1)
  const colors: Record<Status, string> = { Pending: 'bg-slate-500', 'In Progress': 'bg-amber-400', Completed: 'bg-emerald-400' }

  return (
    <section className="pb-8">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">A clearer picture of your day</h2>
        <p className="mt-1 text-xs text-slate-400">A little insight goes a long way toward a smoother operation.</p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Task status breakdown</h3>
              <p className="mt-1 text-[11px] text-slate-400">Your work across all stages</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
              <Activity size={17} />
            </span>
          </div>

          <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-900 border border-white/[0.06]">
            {counts.map(item => (
              <div key={item.status} className={`${colors[item.status]} transition-all`} style={{ width: `${item.count / total * 100}%` }} />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {counts.map(item => (
              <div key={item.status} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${colors[item.status]}`} />
                <span className="text-xs text-slate-400">{item.status}</span>
                <span className="text-xs font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-white">Workload by teammate</h3>
            <p className="mt-1 text-[11px] text-slate-400">Tasks assigned across your team</p>
          </div>

          <div className="flex flex-col gap-3">
            {state.members.map(member => {
              const count = state.tasks.filter(t => t.assigneeId === member.id).length
              return (
                <div key={member.id} className="grid grid-cols-[108px_1fr_24px] items-center gap-3">
                  <span className="truncate text-[11px] font-medium text-slate-300">{member.name.split(' ')[0]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(count / Math.max(state.tasks.length, 1) * 100, count ? 8 : 0)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                  <span className="text-right text-[11px] font-semibold text-white">{count}</span>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kpi title="Average turnaround" value="1.8 days" description="From task creation to completion" icon={<Clock3 size={17} />} trend="−0.3 days" />
        <Kpi title="On-time completion" value="84%" description="Tasks finished before deadline" icon={<ShieldCheck size={17} />} trend="+6.2%" />
      </div>
    </section>
  )
}

function Kpi({ title, value, description, icon, trend }: { title: string; value: string; description: string; icon: React.ReactNode; trend: string }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-1 text-[10px] text-slate-400">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
          <ArrowDownRight size={12} /> {trend}
        </span>
      </div>
    </article>
  )
}

/* Frosted Dialog Modals */
function TaskModal({ members, onClose, onSubmit }: { members: Member[]; onClose: () => void; onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '')
  const [deadline, setDeadline] = useState('2026-09-28')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<Status>('Pending')

  return (
    <Overlay onClose={onClose}>
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Task management</span>
            <h2 id="new-task-title" className="mt-1 text-lg font-black text-white">Create a new task</h2>
            <p className="mt-1 text-xs text-slate-400">Give your team a clear next step.</p>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit({ title, note, assigneeId, deadline, priority, amount: Number(amount) || 0, status }) }} className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-200">Task title</span>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to get done?"
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-200">Operational notes <span className="font-normal text-slate-400">(optional)</span></span>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Add any useful context for your teammate..."
                className="resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-200">Assignee</span>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-slate-200 outline-none focus:border-indigo-400"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">{m.name} · {m.role}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-200">Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white outline-none focus:border-indigo-400"
              />
            </label>

            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-xs font-semibold text-slate-200">Priority</legend>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition ${
                      priority === p
                        ? p === 'Urgent'
                          ? 'border-rose-400 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/30'
                          : 'border-indigo-400 bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/30'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-200">Cash outflow <span className="font-normal text-slate-400">(optional)</span></span>
              <span className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 focus-within:border-indigo-400">
                <span className="mr-2 text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-xs text-white outline-none"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-200">Initial status</span>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-slate-200 outline-none"
              >
                <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.07]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition hover:brightness-110 active:scale-95"
            >
              <Plus size={14} /> Create task
            </button>
          </div>
        </form>
      </motion.section>
    </Overlay>
  )
}

function DigestModal({ text, tasks, members, onClose, onCopy, copied }: { text: string; tasks: Task[]; members: Record<string, Member>; onClose: () => void; onCopy: () => void; copied: boolean }) {
  const completed = tasks.filter(t => t.status === 'Completed')
  const carried = tasks.filter(t => t.status !== 'Completed')
  const tomorrowOutflow = carried.filter(t => t.deadline <= '2026-09-28').reduce((sum, t) => sum + t.amount, 0)

  return (
    <Overlay onClose={onClose}>
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="digest-title"
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Sunday, September 27</span>
            <h2 id="digest-title" className="mt-1 text-lg font-black text-white">Your end-of-day digest</h2>
            <p className="mt-1 text-xs text-slate-400">A quick wrap-up for you and your team.</p>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <DigestSection
            title="Completed today"
            icon={<CheckCircle2 size={15} className="text-emerald-400" />}
            items={completed.map(t => `${t.title} · ${members[t.assigneeId]?.name || 'Unassigned'}`)}
            empty="No tasks completed yet."
          />
          <DigestSection
            title="Carried over / overdue"
            icon={<Clock3 size={15} className="text-amber-400" />}
            items={carried.map(t => `${t.title}${t.deadline < TODAY ? ' · OVERDUE' : ''} · ${members[t.assigneeId]?.name || 'Unassigned'}`)}
            empty="Nothing carried over."
          />

          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <div>
              <p className="text-xs font-bold text-emerald-200">Pending outflow for tomorrow</p>
              <p className="mt-0.5 text-[10px] text-emerald-400">Due by September 28</p>
            </div>
            <span className="text-lg font-black text-emerald-300">{currency(tomorrowOutflow)}</span>
          </div>

          <details className="rounded-xl border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-semibold text-slate-300 hover:text-white">
              Preview WhatsApp digest
            </summary>
            <pre className="whitespace-pre-wrap border-t border-white/[0.08] px-3 py-3 text-[10px] leading-relaxed text-slate-400 font-mono">
              {text}
            </pre>
          </details>
        </div>

        <div className="flex justify-end border-t border-white/[0.08] px-5 py-4 sm:px-6">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:brightness-110 active:scale-95"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy WhatsApp digest'}
          </button>
        </div>
      </motion.section>
    </Overlay>
  )
}

function DigestSection({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: string[]; empty: string }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
        {icon}
        {title}
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-slate-400">
          {items.length}
        </span>
      </h3>
      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-500" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-500">{empty}</p>
      )}
    </section>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4"
    >
      {children}
    </motion.div>
  )
}
