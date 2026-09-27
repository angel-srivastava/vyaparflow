export type TaskStatus = "pending" | "in-progress" | "completed"
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"

export type TeamMember = {
  id: string
  name: string
  role: string
}

export type OperationTask = {
  id: string
  title: string
  note: string
  assigneeId: string
  deadline: string
  priority: TaskPriority
  status: TaskStatus
  outflow: number
  completedAt?: string
}

export type Persona = {
  id: string
  name: string
  shortName: string
  department: string
  accent: string
  team: TeamMember[]
  tasks: OperationTask[]
}

export const DEMO_TODAY = "2026-09-27"

export const PERSONAS: Persona[] = [
  {
    id: "apex",
    name: "Apex Kirana & FMCG Wholesale",
    shortName: "Apex Store",
    department: "Wholesale & retail",
    accent: "emerald",
    team: [
      { id: "amit", name: "Amit Sharma", role: "Procurement" },
      { id: "suresh", name: "Suresh Patel", role: "Logistics" },
      { id: "rohit", name: "Rohit Verma", role: "Delivery" },
      { id: "priya", name: "Priya Nair", role: "Cash Counter" },
    ],
    tasks: [
      { id: "apex-1", title: "Clear packaging invoice with Sharma Containers", note: "Confirm the invoice against the latest packaging delivery before releasing payment.", assigneeId: "amit", deadline: "2026-09-25", priority: "Urgent", status: "pending", outflow: 12000 },
      { id: "apex-2", title: "Inspect morning dairy crates and verify return crates", note: "Count the incoming crates and reconcile the return quantity with the supplier.", assigneeId: "suresh", deadline: "2026-09-26", priority: "High", status: "pending", outflow: 0 },
      { id: "apex-3", title: "Restock bulk wheat flour sacks from central mill", note: "Check stock levels and arrange the next wholesale replenishment.", assigneeId: "suresh", deadline: "2026-09-28", priority: "Medium", status: "pending", outflow: 6500 },
      { id: "apex-4", title: "Deliver wholesale spice orders to restaurant hub", note: "Group restaurant orders by route and confirm each hand-off.", assigneeId: "rohit", deadline: "2026-09-29", priority: "High", status: "pending", outflow: 0 },
      { id: "apex-5", title: "Verify cash drawer balance and tally slips", note: "Reconcile the closing cash total with today's counter slips.", assigneeId: "priya", deadline: "2026-09-27", priority: "Low", status: "completed", outflow: 0, completedAt: DEMO_TODAY },
    ],
  },
  {
    id: "speedtech",
    name: "SpeedTech Auto Workshop",
    shortName: "SpeedTech Garage",
    department: "Automotive service",
    accent: "indigo",
    team: [
      { id: "arjun", name: "Arjun Mehta", role: "Service Lead" },
      { id: "kavita", name: "Kavita Rao", role: "Parts & Inventory" },
      { id: "imran", name: "Imran Khan", role: "Senior Mechanic" },
      { id: "neha", name: "Neha Joshi", role: "Service Advisor" },
    ],
    tasks: [
      { id: "speed-1", title: "Order brake pads for the Verma fleet service", note: "Confirm the OEM-compatible set and delivery window with the parts dealer.", assigneeId: "kavita", deadline: "2026-09-26", priority: "Urgent", status: "pending", outflow: 18400 },
      { id: "speed-2", title: "Complete diagnostics on customer vehicle MH 02 AB 4512", note: "Share the fault-code summary with the service advisor before approval.", assigneeId: "imran", deadline: "2026-09-27", priority: "High", status: "in-progress", outflow: 2500 },
      { id: "speed-3", title: "Prepare tomorrow's workshop bay schedule", note: "Leave one bay open for walk-ins and group jobs by estimated service time.", assigneeId: "arjun", deadline: "2026-09-28", priority: "Medium", status: "pending", outflow: 0 },
      { id: "speed-4", title: "Call customers awaiting service approval", note: "Follow up on the pending estimates and record confirmed approvals.", assigneeId: "neha", deadline: "2026-09-27", priority: "High", status: "pending", outflow: 0 },
      { id: "speed-5", title: "Reconcile parts counter receipts", note: "Match today's parts issues to the work orders before close.", assigneeId: "kavita", deadline: "2026-09-27", priority: "Low", status: "completed", outflow: 0, completedAt: DEMO_TODAY },
    ],
  },
  {
    id: "metro",
    name: "Metro Express Logistics Hub",
    shortName: "Metro Hub",
    department: "Last-mile logistics",
    accent: "amber",
    team: [
      { id: "amit", name: "Amit Sharma", role: "Dispatch Lead" },
      { id: "farah", name: "Farah Ali", role: "Fleet Coordinator" },
      { id: "deepak", name: "Deepak Yadav", role: "Route Captain" },
      { id: "meera", name: "Meera Shah", role: "Hub Operations" },
    ],
    tasks: [
      { id: "metro-1", title: "Resolve delayed parcel batch on route 04", note: "Locate the held parcels and confirm revised ETAs with each recipient.", assigneeId: "deepak", deadline: "2026-09-25", priority: "Urgent", status: "pending", outflow: 4200 },
      { id: "metro-2", title: "Schedule maintenance for delivery van MH 12 CD 9071", note: "Book the service slot and arrange a backup vehicle for tomorrow.", assigneeId: "farah", deadline: "2026-09-27", priority: "High", status: "in-progress", outflow: 8600 },
      { id: "metro-3", title: "Reconcile cash-on-delivery collections", note: "Match rider deposits against the end-of-shift delivery manifest.", assigneeId: "meera", deadline: "2026-09-27", priority: "Medium", status: "pending", outflow: 0 },
      { id: "metro-4", title: "Publish next-day route assignments", note: "Balance parcel volume across available riders before dispatch cutoff.", assigneeId: "amit", deadline: "2026-09-28", priority: "High", status: "pending", outflow: 0 },
      { id: "metro-5", title: "Inspect returned parcels and update hub register", note: "Photograph damaged packaging and note the reason for each return.", assigneeId: "meera", deadline: "2026-09-27", priority: "Low", status: "completed", outflow: 0, completedAt: DEMO_TODAY },
    ],
  },
]

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

export function isOverdue(task: OperationTask) {
  return task.status !== "completed" && task.deadline < DEMO_TODAY
}

export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

export function getPerson(persona: Persona, id: string) {
  return persona.team.find((member) => member.id === id)
}

export function seedWorkspace(persona: Persona) {
  return { team: persona.team.map((member) => ({ ...member })), tasks: persona.tasks.map((task) => ({ ...task })) }
}

export type Workspace = ReturnType<typeof seedWorkspace>
