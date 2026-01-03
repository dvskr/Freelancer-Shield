import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function generateInvoiceNumber(lastNumber?: string | null): string {
  const prefix = 'INV-'
  const currentYear = new Date().getFullYear()

  if (!lastNumber) {
    return `${prefix}${currentYear}-0001`
  }

  const match = lastNumber.match(/(\d{4})-(\d+)$/)
  if (!match) {
    return `${prefix}${currentYear}-0001`
  }

  const [, year, num] = match
  const yearNum = parseInt(year)
  const seqNum = parseInt(num)

  if (yearNum < currentYear) {
    return `${prefix}${currentYear}-0001`
  }

  const nextNum = (seqNum + 1).toString().padStart(4, '0')
  return `${prefix}${currentYear}-${nextNum}`
}

export function generateProjectCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PRJ-${random}`
}

export function calculateDueDate(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export function isOverdue(dueDate: Date | string): boolean {
  return new Date(dueDate) < new Date()
}

export function daysUntilDue(dueDate: Date | string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function dollarsToCents(dollars: string | number): number {
  const value = typeof dollars === "string" ? parseFloat(dollars) : dollars
  return Math.round(value * 100)
}

export function generatePortalToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
