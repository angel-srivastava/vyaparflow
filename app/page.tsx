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
  { id: 'apex', name: 'Apex Kirana & FMCG Wholesale', short: 'Apex Store', category: 'WHOLESALE · KIRANA', location: 'Mumbai, Maharashtra', initials: 'AK', color: 'from-indigo-600 to-violet-500' },
  { id: 'speedtech', name: 'SpeedTech Auto Workshop', short: 'SpeedTech', category: 'AUTOMOTIVE · SERVICE', location: 'Pune, Maharashtra', initials: 'ST', color: 'from-orange-500 to-rose-500' },
  { id: 'metro', name: 'Metro Express Logistics Hub', short: 'Metro Express', category: 'LOGISTICS · DELIVERY', location: 'Bengaluru, Karnataka', initials: 'ME', color: 'from-emerald-600 to-teal-500' },
]
const people = (items: [string, string, string][]): Member[] => items.map(([name, role, color], i) => ({ id: `member-${i + 1}`, name, role, color }))
const makeTask = (id: string, title: string, note: string, assigneeId: string, deadline: string, priority: Priority, status: Status, amount = 0): Task => ({ id, title, note, assigneeId, deadline, priority, status, amount, createdAt: TODAY })
const seed: Record<string, Workspace> = {
  apex: {
    members: people([['Amit Sharma', 'Procurement', 'bg-indigo-100 text-indigo-700'], ['Suresh Patel', 'Logistics', 'bg-amber-100 text-amber-700'], ['Rohit Verma', 'Delivery', 'bg-sky-100 text-sky-700'], ['Priya Nair', 'Cash Counter', 'bg-rose-100 text-rose-700']]),
    tasks: [
      makeTask('a1', 'Clear ₹12,000 packaging invoice with Sharma Containers', 'Confirm the invoice against received cartons before payment.', 'member-1', '2026-09-25', 'Urgent', 'Pending', 12000),
      makeTask('a2', 'Inspect morning dairy crates and verify return crates', 'Check seal integrity and reconcile returnable crates.', 'member-2', '2026-09-26', 'High', 'In Progress'),
      makeTask('a3', 'Restock bulk wheat flour sacks from central mill', 'Coordinate stock availability with the central mill.', 'member-2', '2026-09-28', 'Medium', 'Pending', 6500),
      makeTask('a4', 'Deliver wholesale spice orders to restaurant hub', 'Three restaurant orders; collect signatures on delivery.', 'member-3', '2026-09-29', 'High', 'In Progress'),
      makeTask('a5', 'Verify cash drawer balance and tally slips', "Match counter cash to today's closing slips.", 'member-4', TODAY, 'Low', 'Completed'),
    ],
  },
  speedtech: {
    members: people([['Arjun Mehta', 'Service Lead', 'bg-indigo-100 text-indigo-700'], ['Kavita Rao', 'Parts & Inventory', 'bg-amber-100 text-amber-700'], ['Manoj Singh', 'Technician', 'bg-sky-100 text-sky-700'], ['Neha Kulkarni', 'Front Desk', 'bg-rose-100 text-rose-700']]),
    tasks: [makeTask('s1', 'Replace brake pads on MH12 AB 4821', 'Customer pickup scheduled this afternoon.', 'member-3', '2026-09-27', 'Urgent', 'In Progress', 4800), makeTask('s2', 'Reconcile pending Bosch parts invoice', 'Confirm received filters and spark plugs before settlement.', 'member-2', '2026-09-26', 'High', 'Pending', 8600), makeTask('s3', 'Complete oil change and 20-point inspection', 'Service bay two; update vehicle service history.', 'member-3', '2026-09-28', 'Medium', 'Pending', 3200), makeTask('s4', 'Call back customers for service approvals', 'Follow up on the three open repair estimates.', 'member-4', '2026-09-28', 'Low', 'In Progress'), makeTask('s5', "Close yesterday's workshop job cards", 'File signed customer approvals.', 'member-1', '2026-09-27', 'Medium', 'Completed')],
  },
  metro: {
    members: people([['Vikram Das', 'Fleet Manager', 'bg-indigo-100 text-indigo-700'], ['Ananya Iyer', 'Dispatch', 'bg-amber-100 text-amber-700'], ['Ramesh Yadav', 'Driver Lead', 'bg-sky-100 text-sky-700'], ['Farah Khan', 'Accounts', 'bg-rose-100 text-rose-700']]),
    tasks: [makeTask('m1', 'Settle diesel advance with Ramesh Yadav', 'Match fuel slips to vehicle route logs.', 'member-4', '2026-09-25', 'Urgent', 'Pending', 9500), makeTask('m2', 'Resolve delayed Whitefield B2B shipment', 'Confirm revised delivery window with client.', 'member-2', '2026-09-26', 'High', 'In Progress'), makeTask('m3', 'Schedule routine maintenance for van KA 03 9214', 'Book the vehicle into the partner service bay.', 'member-1', '2026-09-28', 'Medium', 'Pending', 7400), makeTask('m4', "Reconcile PODs for yesterday's final-mile routes", 'Collect missing proof-of-delivery photos from drivers.', 'member-3', '2026-09-29', 'High', 'In Progress'), makeTask('m5', 'Publish the morning fleet dispatch plan', 'Share route assignments with the driver group.', 'member-2', TODAY, 'Low', 'Completed')],
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
    } catch { /* Ignore invalid local demo state and restore the seeded workspace. */ }
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
    setPersonaId(id); setPersonaOpen(false); setSearch(''); setAssigneeFilter('all'); setPriorityFilter('all'); setOverdueOnly(false)
    setToast(`Switched to ${personas.find(p => p.id === id)?.short}`)
  }
  const addTask = (details: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'task', task: { ...details, id: newId(), createdAt: TODAY } })
    setModal(null); setToast('Task added to your operations board')
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
    <main className="min-h-screen bg-[#f6f7fb] pb-44 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Zap size={20} fill="currentColor" /></div>
            <div><div className="flex items-center gap-2"><span className="text-[15px] font-extrabold tracking-tight sm:text-[17px]">VyaparFlow</span><span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 sm:inline-flex">MSME OPS ENGINE</span></div><p className="hidden text-[11px] text-slate-400 sm:block">Your business, in rhythm.</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button onClick={() => setPersonaOpen(v => !v)} className="flex max-w-[155px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left hover:border-indigo-200 sm:max-w-[245px] sm:px-3" aria-expanded={personaOpen} aria-label="Switch store persona"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${persona.color} text-[10px] font-bold text-white`}>{persona.initials}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold">{persona.short}</span><span className="hidden text-[10px] text-slate-400 sm:block">Guest Store Manager</span></span><ChevronDown size={14} className="shrink-0 text-slate-400" /></button>
              <AnimatePresence>{personaOpen && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{personas.map(item => <button key={item.id} onClick={() => switchPersona(item.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50 ${personaId === item.id ? 'bg-indigo-50/70' : ''}`}><span className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-[10px] font-bold text-white`}>{item.initials}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.name}</span><span className="text-[10px] text-slate-400">{item.category}</span></span>{personaId === item.id && <Check size={15} className="text-indigo-600" />}</button>)}</motion.div>}</AnimatePresence>
            </div>
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 lg:flex"><div className="flex size-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><span className="text-xs font-bold">G</span></div><div><p className="text-xs font-semibold">Guest Admin</p><p className="text-[10px] text-slate-400">{persona.short}</p></div></div>
            <button onClick={() => setModal('digest')} className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 md:flex"><FileText size={15} /> Generate EOD Digest</button>
            <button onClick={() => setModal('task')} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 sm:px-4"><Plus size={16} /> <span className="hidden sm:inline">New Task</span><span className="sm:hidden">Task</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <section className="flex flex-wrap items-center justify-between gap-3 py-5 sm:py-7">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-xs backdrop-blur">
                <span className="size-1.5 rounded-full bg-indigo-600" />
                <span>LIVE WORKSPACE</span>
                <span className="text-indigo-300">/</span>
                <span className="font-semibold text-indigo-600">{persona.category}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 shadow-xs">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>SYNC ENGINE ACTIVE</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">Good morning, Guest Admin <span className="inline-block">👋</span></h1>
            <p className="mt-1 text-sm text-slate-500">Here's what's moving at <span className="font-semibold text-slate-700">{persona.name}</span> today.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-500 shadow-xs backdrop-blur">
            <CalendarDays size={15} className="text-slate-400" /> Sunday, September 27, 2026
          </div>
        </section>

        <section aria-label="Operational metrics" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:sticky lg:top-[68px] lg:z-20 lg:grid-cols-6 lg:bg-[#f6f7fb]/95 lg:py-3 lg:backdrop-blur">
          <Metric label="Total ops tasks" value={state.tasks.length} icon={<Target size={15} />} tone="slate" foot="Across all workflows" />
          <Metric label="Active WIP" value={active.length} icon={<Activity size={15} />} tone="amber" foot="Needs attention" />
          <Metric label="Completed" value={completed.length} icon={<CheckCircle2 size={15} />} tone="emerald" foot="Closed out today" />
          <Metric label="Overdue & blocked" value={overdue.length} icon={<AlertTriangle size={15} />} tone="rose" foot={overdue.length ? 'Immediate triage' : 'All on track'} alert={overdue.length > 0} />
          <Metric label="Productivity score" value={`${productivity}%`} icon={<TrendingUp size={15} />} tone="indigo" foot="Completion rate" />
          <Metric label="Pending cash outflow" value={currency(pendingOutflow)} icon={<Wallet size={15} />} tone="amber" foot="On incomplete tasks" compact badge="Active Liability" isLiquidity />
        </section>

        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-200 sm:flex-row sm:items-center">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Main views">{([['board', 'Daily Operations'], ['team', 'Team Directory'], ['analytics', 'Productivity']] as const).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition sm:px-4 ${tab === key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{key === 'board' ? <LayoutGrid size={15} /> : key === 'team' ? <Users size={15} /> : <BarChart3 size={15} />}{label}</button>)}</nav>
          <div className="flex items-center gap-2 pb-3 sm:pb-2"><span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:inline">Workspace</span><div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setLayout('kanban')} aria-label="Kanban view" className={`rounded-md p-1.5 ${layout === 'kanban' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid size={15} /></button><button onClick={() => setLayout('list')} aria-label="List view" className={`rounded-md p-1.5 ${layout === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}><List size={15} /></button></div><button aria-label="Workspace settings" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"><Settings2 size={15} /></button></div>
        </div>

        {tab === 'board' && <>
          {overdue.length > 0 && <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><AlertTriangle size={18} /></span><div><h2 className="text-sm font-bold text-rose-900">Overdue triage radar <span className="ml-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] text-white">{overdue.length} tasks</span></h2><p className="mt-1 text-xs leading-relaxed text-rose-700">{overdue.length} operational tasks require immediate intervention! Unresolved supplier payments and delivery delays.</p></div></div><button onClick={() => { dispatch({ type: 'escalate' }); setToast('All overdue tasks escalated to urgent') }} className="shrink-0 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700">Escalate all overdue <ArrowUpRight size={14} className="ml-1 inline" /></button></motion.section>}
          <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:p-3.5">
            <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search task, staff, or vendor..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100" /></label>
            <div className="flex flex-wrap items-center gap-2"><select aria-label="Filter by assignee" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="h-10 min-w-[120px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-300 sm:flex-none"><option value="all">All assignees</option>{state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><select aria-label="Filter by priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 min-w-[112px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-300 sm:flex-none"><option value="all">All priorities</option>{(['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map(p => <option key={p} value={p}>{p} priority</option>)}</select><button onClick={() => setOverdueOnly(v => !v)} className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${overdueOnly ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}><Filter size={14} /> <span>Overdue only</span><span className={`relative h-4 w-7 rounded-full transition ${overdueOnly ? 'bg-rose-500' : 'bg-slate-200'}`}><span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${overdueOnly ? 'left-3.5' : 'left-0.5'}`} /></span></button></div>
          </section>
          {layout === 'kanban' ? <div className="grid items-start gap-4 lg:grid-cols-3">{(['Pending', 'In Progress', 'Completed'] as Status[]).map(status => { const items = filtered.filter(t => t.status === status); return <section key={status} className="min-w-0"><div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${status === 'Pending' ? 'bg-slate-400' : status === 'In Progress' ? 'bg-amber-400' : 'bg-emerald-500'}`} /><h2 className="text-sm font-bold">{status === 'Pending' ? 'To do' : status}</h2><span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{items.length}</span></div><button aria-label={`More ${status} options`} className="rounded-md p-1 text-slate-400 hover:bg-white"><MoreHorizontal size={17} /></button></div><div className="flex flex-col gap-3">{items.map(task => <TaskCard key={task.id} task={task} member={membersById[task.assigneeId]} onStatus={setStatus} />)}{items.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-xs text-slate-400">No tasks in this column</div>}</div></section> })}</div> : <TaskTable tasks={filtered} members={membersById} onStatus={setStatus} />}
          <div className="mt-5 flex items-center justify-between px-1 text-[11px] text-slate-400"><span>Showing {filtered.length} of {state.tasks.length} operational tasks</span><span className="hidden sm:inline">Last synced just now <span className="ml-1 inline-block size-1.5 rounded-full bg-emerald-500" /></span></div>
                  </>}

        {tab === 'team' && <TeamView state={state} dispatch={dispatch} name={employeeName} role={employeeRole} setName={setEmployeeName} setRole={setEmployeeRole} />}
        {tab === 'analytics' && <AnalyticsView state={state} />}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-3 sm:bottom-6 sm:px-6">
        <div className="pointer-events-auto mx-auto max-w-[920px] rounded-2xl border border-slate-300/80 bg-white/90 p-2.5 shadow-2xl shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:border-slate-400/80 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={startSpeech}
              aria-label={listening ? 'Stop voice capture' : 'Start voice capture'}
              className={`relative flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-all duration-200 ${
                listening ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
              }`}
            >
              <span className={listening ? 'absolute inset-0 animate-ping rounded-xl bg-rose-400 opacity-40' : ''} />
              {listening ? <AudioLines size={19} className="relative" /> : <Mic size={19} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="relative">
                <input
                  value={ambient}
                  onChange={e => setAmbient(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addAmbientTask()
                  }}
                  placeholder="Say or type: 'Pay ₹4,500 to Ramesh by Friday for dairy crate'..."
                  className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 pl-3 pr-10 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                />
                <button
                  onClick={addAmbientTask}
                  aria-label="Capture task"
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs transition hover:bg-indigo-700"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">
                Quick capture <span className="text-slate-300">·</span> Natural language parser with currency & deadline detection
              </p>
            </div>
            <button
              onClick={() => setModal('task')}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 sm:hidden"
              aria-label="Open full task form"
            >
              <Plus size={19} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>{modal === 'task' && <TaskModal members={state.members} onClose={() => setModal(null)} onSubmit={addTask} />}{modal === 'digest' && <DigestModal text={digestText} tasks={state.tasks} members={membersById} onClose={() => setModal(null)} onCopy={copyDigest} copied={copied} />}{toast && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">{toast}</motion.div>}</AnimatePresence>
    </main>
  )
}

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
}) {
  const tones: Record<string, string> = {
    slate: 'text-slate-600 bg-slate-100',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  }

  const cardStyling = isLiquidity
    ? 'border-amber-300/90 bg-gradient-to-b from-amber-50/90 via-white to-amber-100/40 shadow-[0_4px_16px_rgba(245,158,11,0.08)] ring-1 ring-amber-400/30'
    : alert
    ? 'border-rose-200/90 bg-gradient-to-b from-white to-rose-50/70 shadow-[0_2px_8px_rgba(244,63,94,0.05)]'
    : 'border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 shadow-[0_2px_8px_rgba(15,23,42,0.03)]'

  return (
    <div
      className={`rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-4 ${cardStyling}`}
    >
      <div className="mb-3 flex items-center justify-between gap-1.5">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-amber-300/80 bg-amber-100/90 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide text-amber-800 shadow-2xs">
              {badge}
            </span>
          )}
          <span className={`flex size-7 items-center justify-center rounded-lg ${tones[tone]}`}>
            {icon}
          </span>
        </div>
      </div>
      <div
        className={`truncate font-bold tracking-tight ${compact ? 'text-[17px] sm:text-lg' : 'text-2xl'} ${
          isLiquidity
            ? 'font-extrabold text-amber-900'
            : tone === 'amber'
            ? 'text-amber-600'
            : tone === 'emerald'
            ? 'text-emerald-600'
            : tone === 'rose'
            ? 'text-rose-600'
            : tone === 'indigo'
            ? 'text-indigo-600'
            : 'text-slate-900'
        }`}
      >
        {alert && <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-rose-500 align-middle" />}
        {value}
      </div>
      <p className={`mt-1 truncate text-[10px] ${isLiquidity ? 'font-medium text-amber-700/80' : 'text-slate-400'}`}>
        {foot}
      </p>
    </div>
  )
}

function TaskCard({ task, member, onStatus }: { task: Task; member?: Member; onStatus: (id: string, status: Status) => void }) {
  const isOverdue = task.status !== 'Completed' && task.deadline < TODAY
  const priorityClass: Record<Priority, string> = { Low: 'bg-slate-100 text-slate-600', Medium: 'bg-blue-50 text-blue-700', High: 'bg-amber-50 text-amber-700', Urgent: 'bg-rose-50 text-rose-700' }
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Hello ${member?.name || 'there'}, reminder from VyaparFlow: Task '${task.title}' is marked as ${task.priority} and is due on ${dateLabel(task.deadline)}. Please update status.`)}`
  return <motion.article layout className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"><div className="mb-2.5 flex items-start justify-between gap-3"><h3 className="text-[13px] font-semibold leading-[1.5] text-slate-800">{task.title}</h3><button aria-label="Task options" className="shrink-0 rounded-md p-0.5 text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"><Ellipsis size={17} /></button></div><p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{task.note}</p><div className="mb-3 flex flex-wrap items-center gap-1.5"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${priorityClass[task.priority]}`}>{task.priority === 'Urgent' ? 'URGENT' : task.priority}</span>{task.amount > 0 && <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{currency(task.amount)} outflow</span>}{isOverdue && <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[9px] font-bold tracking-wide text-white"><AlertTriangle size={10} /> OVERDUE</span>}</div><div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3"><div className="flex min-w-0 items-center gap-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${member?.color || 'bg-slate-100 text-slate-600'}`}>{member ? initials(member.name) : '?'}</span><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-700">{member?.name || 'Unassigned'}</p><p className="truncate text-[9px] text-slate-400">{member?.role || 'Team'}</p></div></div><span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}><CalendarDays size={12} />{dateLabel(task.deadline)}</span></div><div className="flex items-center justify-between gap-2"><select aria-label={`Change status for ${task.title}`} value={task.status} onChange={e => onStatus(task.id, e.target.value as Status)} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-600 outline-none focus:border-indigo-300"><option>Pending</option><option>In Progress</option><option>Completed</option></select><a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50"><MessageCircle size={13} /> Ping on WhatsApp</a></div></motion.article>
}

function TaskTable({ tasks, members, onStatus }: { tasks: Task[]; members: Record<string, Member>; onStatus: (id: string, status: Status) => void }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="px-4 py-3 font-semibold">Task</th><th className="px-4 py-3 font-semibold">Assignee</th><th className="px-4 py-3 font-semibold">Priority</th><th className="px-4 py-3 font-semibold">Due date</th><th className="px-4 py-3 font-semibold">Outflow</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead><tbody>{tasks.map(task => <tr key={task.id} className="border-b border-slate-50 text-xs last:border-0 hover:bg-slate-50/70"><td className="max-w-[360px] px-4 py-3.5 font-semibold text-slate-700">{task.title}</td><td className="px-4 py-3.5 text-slate-500">{members[task.assigneeId]?.name || 'Unassigned'}</td><td className="px-4 py-3.5">{task.priority}</td><td className={`px-4 py-3.5 ${task.status !== 'Completed' && task.deadline < TODAY ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>{dateLabel(task.deadline)}</td><td className="px-4 py-3.5 font-medium text-emerald-700">{task.amount ? currency(task.amount) : '—'}</td><td className="px-4 py-3.5"><select aria-label={`Change status for ${task.title}`} value={task.status} onChange={e => onStatus(task.id, e.target.value as Status)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] outline-none"><option>Pending</option><option>In Progress</option><option>Completed</option></select></td></tr>)}</tbody></table></div>
}

function TeamView({ state, dispatch, name, role, setName, setRole }: { state: Workspace; dispatch: React.Dispatch<Action>; name: string; role: string; setName: (s: string) => void; setRole: (s: string) => void }) {
  const addMember = () => { if (!name.trim() || !role.trim()) return; dispatch({ type: 'member', member: { id: newId(), name: name.trim(), role: role.trim(), color: 'bg-violet-100 text-violet-700' } }); setName(''); setRole('') }
  return <section className="pb-6"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Your people, at a glance</h2><p className="mt-1 text-xs text-slate-500">See who's carrying what and keep the work balanced.</p></div><span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">{state.members.length} team members</span></div><div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{state.members.map(member => { const assigned = state.tasks.filter(t => t.assigneeId === member.id); const active = assigned.filter(t => t.status !== 'Completed').length; const done = assigned.length - active; const status = active >= 4 ? 'Overloaded' : active >= 2 ? 'Balanced' : 'Available'; const tone = status === 'Overloaded' ? 'bg-rose-50 text-rose-700' : status === 'Balanced' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'; return <article key={member.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className={`flex size-12 items-center justify-center rounded-2xl text-sm font-bold ${member.color}`}>{initials(member.name)}</span><div><h3 className="text-sm font-bold">{member.name}</h3><p className="mt-0.5 text-xs text-slate-400">{member.role}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><div className="flex items-center gap-5"><div><p className="text-lg font-bold">{active}</p><p className="text-[10px] text-slate-400">Active tasks</p></div><div><p className="text-lg font-bold text-emerald-600">{done}</p><p className="text-[10px] text-slate-400">Completed</p></div></div><div className="flex -space-x-2">{assigned.slice(0, 3).map((task, i) => <span key={task.id} title={task.title} className={`flex size-7 items-center justify-center rounded-full border-2 border-white text-[9px] ${i % 2 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{task.status === 'Completed' ? <Check size={12} /> : <Circle size={10} />}</span>)}</div></div></article> })}</div><form onSubmit={e => { e.preventDefault(); addMember() }} className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><Plus size={16} /></span><div><h3 className="text-xs font-bold">Add someone to the team</h3><p className="text-[10px] text-slate-500">Bring a new teammate into your daily operations.</p></div></div><div className="flex flex-col gap-2 sm:flex-row"><input value={name} onChange={e => setName(e.target.value)} required placeholder="Full name" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-300" /><input value={role} onChange={e => setRole(e.target.value)} required placeholder="Department or role" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-300" /><button type="submit" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"><Plus size={14} /> Add employee</button></div></form></section>
}

function AnalyticsView({ state }: { state: Workspace }) {
  const counts = (['Pending', 'In Progress', 'Completed'] as Status[]).map(status => ({ status, count: state.tasks.filter(t => t.status === status).length }))
  const total = Math.max(state.tasks.length, 1)
  const colors: Record<Status, string> = { Pending: 'bg-slate-300', 'In Progress': 'bg-amber-400', Completed: 'bg-emerald-500' }
  return <section className="pb-8"><div className="mb-5"><h2 className="text-lg font-bold">A clearer picture of your day</h2><p className="mt-1 text-xs text-slate-500">A little insight goes a long way toward a smoother operation.</p></div><div className="mb-5 grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-sm font-bold">Task status breakdown</h3><p className="mt-1 text-[11px] text-slate-400">Your work across all stages</p></div><span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Activity size={17} /></span></div><div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-100">{counts.map(item => <div key={item.status} className={`${colors[item.status]} transition-all`} style={{ width: `${item.count / total * 100}%` }} />)}</div><div className="flex flex-wrap gap-x-6 gap-y-3">{counts.map(item => <div key={item.status} className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${colors[item.status]}`} /><span className="text-xs text-slate-500">{item.status}</span><span className="text-xs font-bold text-slate-800">{item.count}</span></div>)}</div></article><article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5"><h3 className="text-sm font-bold">Workload by teammate</h3><p className="mt-1 text-[11px] text-slate-400">Tasks assigned across your team</p></div><div className="flex flex-col gap-3">{state.members.map(member => { const count = state.tasks.filter(t => t.assigneeId === member.id).length; return <div key={member.id} className="grid grid-cols-[108px_1fr_24px] items-center gap-3"><span className="truncate text-[11px] font-medium text-slate-600">{member.name.split(' ')[0]}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(count / Math.max(state.tasks.length, 1) * 100, count ? 8 : 0)}%` }} className="h-full rounded-full bg-indigo-500" /></div><span className="text-right text-[11px] font-semibold text-slate-600">{count}</span></div> })}</div></article></div><div className="grid gap-4 sm:grid-cols-2"><Kpi title="Average turnaround" value="1.8 days" description="From task creation to completion" icon={<Clock3 size={17} />} trend="−0.3 days" /><Kpi title="On-time completion" value="84%" description="Tasks finished before deadline" icon={<ShieldCheck size={17} />} trend="+6.2%" /></div></section>
}
function Kpi({ title, value, description, icon, trend }: { title: string; value: string; description: string; icon: React.ReactNode; trend: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{title}</span><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</span></div><div className="mt-4 flex items-end justify-between"><div><p className="text-3xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[10px] text-slate-400">{description}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700"><ArrowDownRight size={12} /> {trend}</span></div></article> }

function TaskModal({ members, onClose, onSubmit }: { members: Member[]; onClose: () => void; onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void }) {
  const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [assigneeId, setAssigneeId] = useState(members[0]?.id || ''); const [deadline, setDeadline] = useState('2026-09-28'); const [priority, setPriority] = useState<Priority>('Medium'); const [amount, setAmount] = useState(''); const [status, setStatus] = useState<Status>('Pending')
  return <Overlay onClose={onClose}><motion.section initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="new-task-title" className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Task management</span><h2 id="new-task-title" className="mt-1 text-lg font-bold">Create a new task</h2><p className="mt-1 text-xs text-slate-500">Give your team a clear next step.</p></div><button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><form onSubmit={e => { e.preventDefault(); onSubmit({ title, note, assigneeId, deadline, priority, amount: Number(amount) || 0, status }) }} className="max-h-[75vh] overflow-y-auto p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-xs font-semibold text-slate-700">Task title</span><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to get done?" className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></label><label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-xs font-semibold text-slate-700">Operational notes <span className="font-normal text-slate-400">(optional)</span></span><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add any useful context for your teammate..." className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></label><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-slate-700">Assignee</span><select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-300">{members.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}</select></label><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-slate-700">Deadline</span><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-300" /></label><fieldset className="sm:col-span-2"><legend className="mb-2 text-xs font-semibold text-slate-700">Priority</legend><div className="grid grid-cols-4 gap-2">{(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => <button type="button" key={p} onClick={() => setPriority(p)} className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition ${priority === p ? p === 'Urgent' ? 'border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-100' : 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{p}</button>)}</div></fieldset><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-slate-700">Cash outflow <span className="font-normal text-slate-400">(optional)</span></span><span className="flex h-10 items-center rounded-xl border border-slate-200 px-3 focus-within:border-indigo-300"><span className="mr-2 text-xs text-slate-400">₹</span><input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-transparent text-xs outline-none" /></span></label><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-slate-700">Initial status</span><select value={status} onChange={e => setStatus(e.target.value as Status)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none"><option>Pending</option><option>In Progress</option></select></label></div><div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"><Plus size={14} /> Create task</button></div></form></motion.section></Overlay>
}
function DigestModal({ text, tasks, members, onClose, onCopy, copied }: { text: string; tasks: Task[]; members: Record<string, Member>; onClose: () => void; onCopy: () => void; copied: boolean }) {
  const completed = tasks.filter(t => t.status === 'Completed'); const carried = tasks.filter(t => t.status !== 'Completed'); const tomorrowOutflow = carried.filter(t => t.deadline <= '2026-09-28').reduce((sum, t) => sum + t.amount, 0)
  return <Overlay onClose={onClose}><motion.section initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="digest-title" className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Sunday, September 27</span><h2 id="digest-title" className="mt-1 text-lg font-bold">Your end-of-day digest</h2><p className="mt-1 text-xs text-slate-500">A quick wrap-up for you and your team.</p></div><button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6"><DigestSection title="Completed today" icon={<CheckCircle2 size={15} className="text-emerald-600" />} items={completed.map(t => `${t.title} · ${members[t.assigneeId]?.name || 'Unassigned'}`)} empty="No tasks completed yet." /><DigestSection title="Carried over / overdue" icon={<Clock3 size={15} className="text-amber-600" />} items={carried.map(t => `${t.title}${t.deadline < TODAY ? ' · OVERDUE' : ''} · ${members[t.assigneeId]?.name || 'Unassigned'}`)} empty="Nothing carried over." /><div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"><div><p className="text-xs font-semibold text-emerald-900">Pending outflow for tomorrow</p><p className="mt-0.5 text-[10px] text-emerald-700">Due by September 28</p></div><span className="text-lg font-bold text-emerald-700">{currency(tomorrowOutflow)}</span></div><details className="rounded-xl border border-slate-200"><summary className="cursor-pointer px-3 py-2.5 text-[11px] font-semibold text-slate-600">Preview WhatsApp digest</summary><pre className="whitespace-pre-wrap border-t border-slate-100 px-3 py-3 text-[10px] leading-relaxed text-slate-500">{text}</pre></details></div><div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6"><button onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied!' : 'Copy WhatsApp digest'}</button></div></motion.section></Overlay>
}
function DigestSection({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: string[]; empty: string }) { return <section><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800">{icon}{title}<span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{items.length}</span></h3>{items.length ? <ul className="flex flex-col gap-2">{items.map((item, i) => <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-300" />{item}</li>)}</ul> : <p className="text-[11px] text-slate-400">{empty}</p>}</section> }
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }} onKeyDown={e => { if (e.key === 'Escape') onClose() }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">{children}</motion.div> }
