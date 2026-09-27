export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked"
export type Priority = "Low" | "Medium" | "High" | "Urgent"

export type TeamMember = {
  id: string
  name: string
  role: string
}

export type OpsTask = {
  id: string
  title: string
  note: string
  assigneeId: string
  priority: Priority
  status: TaskStatus
  deadline: string
  amount: number
  completedAt?: string
  vendor?: string
}

export type WorkspaceSeed = {
  id: string
  name: string
  shortName: string
  initials: string
  team: TeamMember[]
  tasks: OpsTask[]
  dailyOutflow: number
}

const today = "2026-09-27"

export const workspaceSeeds: WorkspaceSeed[] = [
  {
    id: "apex",
    name: "Apex Kirana & FMCG Wholesale",
    shortName: "Apex Store",
    initials: "AK",
    dailyOutflow: 18500,
    team: [
      { id: "amit", name: "Amit Sharma", role: "Procurement" },
      { id: "suresh", name: "Suresh Patel", role: "Logistics" },
      { id: "rohit", name: "Rohit Verma", role: "Delivery" },
      { id: "priya", name: "Priya Nair", role: "Cash Counter" },
    ],
    tasks: [
      { id: "apex-1", title: "Clear ₹12,000 packaging invoice with Sharma Containers", note: "Confirm the statement against the last delivery before release.", assigneeId: "amit", priority: "Urgent", status: "pending", deadline: "2026-09-25", amount: 12000, vendor: "Sharma Containers" },
      { id: "apex-2", title: "Inspect morning dairy crates and verify return crates", note: "Check count, seal condition, and the supplier return slip.", assigneeId: "suresh", priority: "High", status: "in-progress", deadline: "2026-09-26", amount: 0, vendor: "Dairy supplier" },
      { id: "apex-3", title: "Restock bulk wheat flour sacks from central mill", note: "Raise the purchase order for the weekly wholesale run.", assigneeId: "suresh", priority: "Medium", status: "pending", deadline: "2026-09-28", amount: 6500, vendor: "Central mill" },
      { id: "apex-4", title: "Deliver wholesale spice orders to restaurant hub", note: "Keep signed delivery slips for all three restaurant accounts.", assigneeId: "rohit", priority: "High", status: "in-progress", deadline: "2026-09-29", amount: 0, vendor: "Restaurant hub" },
      { id: "apex-5", title: "Verify cash drawer balance and tally slips", note: "Drawer count reconciled with the morning sales slips.", assigneeId: "priya", priority: "Low", status: "completed", deadline: today, amount: 0, completedAt: today },
    ],
  },
  {
    id: "speedtech",
    name: "SpeedTech Auto Workshop",
    shortName: "SpeedTech Garage",
    initials: "ST",
    dailyOutflow: 24700,
    team: [
      { id: "arjun", name: "Arjun Mehta", role: "Service Lead" },
      { id: "neha", name: "Neha Kulkarni", role: "Parts & Procurement" },
      { id: "imran", name: "Imran Khan", role: "Diagnostics" },
      { id: "kavya", name: "Kavya Rao", role: "Front Desk" },
    ],
    tasks: [
      { id: "speed-1", title: "Release ₹8,200 brake parts payment to City Auto Spares", note: "Match the supplier invoice to the Honda City job card.", assigneeId: "neha", priority: "Urgent", status: "pending", deadline: "2026-09-26", amount: 8200, vendor: "City Auto Spares" },
      { id: "speed-2", title: "Finish diagnostics on the blue Swift", note: "Road test after clearing the intermittent engine warning.", assigneeId: "imran", priority: "High", status: "in-progress", deadline: "2026-09-27", amount: 0 },
      { id: "speed-3", title: "Order synthetic oil and filter kits for Monday", note: "Restock fast-moving service items before opening.", assigneeId: "neha", priority: "Medium", status: "pending", deadline: "2026-09-28", amount: 12500, vendor: "Metro Lubes" },
      { id: "speed-4", title: "Call back the Verma family about their SUV service", note: "Share the inspection estimate and confirm pickup time.", assigneeId: "kavya", priority: "Medium", status: "pending", deadline: "2026-09-29", amount: 0 },
      { id: "speed-5", title: "Close workshop register and reconcile card slips", note: "End-of-day totals match the counter report.", assigneeId: "arjun", priority: "Low", status: "completed", deadline: today, amount: 0, completedAt: today },
    ],
  },
  {
    id: "metro",
    name: "Metro Express Logistics Hub",
    shortName: "Metro Logistics",
    initials: "ME",
    dailyOutflow: 32600,
    team: [
      { id: "vikram", name: "Vikram Singh", role: "Fleet Lead" },
      { id: "farah", name: "Farah Ali", role: "Dispatch" },
      { id: "deepak", name: "Deepak Joshi", role: "Driver" },
      { id: "ananya", name: "Ananya Bose", role: "Accounts" },
    ],
    tasks: [
      { id: "metro-1", title: "Settle ₹18,400 diesel account with Highway Fuels", note: "Reconcile fleet slips before the supplier cutoff.", assigneeId: "ananya", priority: "Urgent", status: "pending", deadline: "2026-09-25", amount: 18400, vendor: "Highway Fuels" },
      { id: "metro-2", title: "Locate delayed parcel batch for Lakeside route", note: "Trace the scan gap and call the receiving shop.", assigneeId: "farah", priority: "High", status: "in-progress", deadline: "2026-09-26", amount: 0, vendor: "Lakeside route" },
      { id: "metro-3", title: "Book preventive service for van MH 12 AB 4210", note: "Confirm brake inspection slot and collect the estimate.", assigneeId: "vikram", priority: "Medium", status: "pending", deadline: "2026-09-28", amount: 14200, vendor: "Shree Motors" },
      { id: "metro-4", title: "Dispatch wholesale cartons to the north market", note: "Verify route sheet and receiver phone numbers.", assigneeId: "deepak", priority: "High", status: "in-progress", deadline: "2026-09-29", amount: 0 },
      { id: "metro-5", title: "Reconcile proof-of-delivery slips from route 4", note: "All six receipts have been checked and filed.", assigneeId: "ananya", priority: "Low", status: "completed", deadline: today, amount: 0, completedAt: today },
    ],
  },
]

export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDeadline(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`))
}

export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

export function isOverdue(task: OpsTask) {
  return task.status !== "completed" && task.deadline < today
}
