import { supabase } from '../lib/supabase'

export const getTimezoneOptions = () => {
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-5/-4)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-6/-5)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-7/-6)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8/-7)' },
    { value: 'America/Anchorage', label: 'Alaska Time (UTC-9/-8)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (UTC-10)' },
    { value: 'America/Toronto', label: 'Toronto (UTC-5/-4)' },
    { value: 'America/Vancouver', label: 'Vancouver (UTC-8/-7)' },
    { value: 'Europe/London', label: 'London (UTC+0/+1)' },
    { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
    { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)' },
    { value: 'Europe/Rome', label: 'Rome (UTC+1/+2)' },
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1/+2)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' },
    { value: 'Asia/Seoul', label: 'Seoul (UTC+9)' },
    { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8)' },
    { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (UTC+5:30)' },
    { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
    { value: 'Australia/Melbourne', label: 'Melbourne (UTC+10/+11)' },
    { value: 'Australia/Perth', label: 'Perth (UTC+8)' },
    { value: 'Pacific/Auckland', label: 'Auckland (UTC+12/+13)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
    { value: 'America/Mexico_City', label: 'Mexico City (UTC-6/-5)' },
    { value: 'Africa/Cairo', label: 'Cairo (UTC+2)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
  ]

  // Sort alphabetically by label
  return timezones.sort((a, b) => a.label.localeCompare(b.label))
}

export const getUserTimezone = () => {
  return localStorage.getItem('user-timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const setUserTimezone = (timezone) => {
  localStorage.setItem('user-timezone', timezone)
}

// Get user's locale based on browser settings
export const getUserLocale = () => {
  return navigator.language || 'en-US'
}

// Format date from database for HTML date input (YYYY-MM-DD)
// FIXED: Extract date part directly without timezone conversion
export const formatDateForInput = (date, timezone = getUserTimezone()) => {
  if (!date) return ''
  
  console.log('Formatting date for input:', date)
  
  // Extract just the date part from ISO string (YYYY-MM-DD)
  const dateStr = date.toString()
  
  if (dateStr.includes('T')) {
    // If it's an ISO string, extract the date part
    const datePart = dateStr.split('T')[0]
    console.log('Extracted date part:', datePart)
    return datePart
  }
  
  // If it's already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log('Date already in YYYY-MM-DD format:', dateStr)
    return dateStr
  }
  
  // Fallback: create date and extract YYYY-MM-DD
  const dateObj = new Date(date)
  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getUTCDate()).padStart(2, '0')
  const result = `${year}-${month}-${day}`
  
  console.log('Fallback formatted date:', result)
  return result
}

// Format datetime from database for HTML datetime-local input
// FIXED: Use user's locale instead of hardcoded 'sv-SE'
export const formatDateTimeForInput = (date, timezone = getUserTimezone()) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  const userLocale = getUserLocale()
  
  // Create a datetime string in the user's timezone using their locale
  const formatter = new Intl.DateTimeFormat(userLocale, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Force 24-hour format for datetime-local input
  })
  
  const parts = formatter.formatToParts(dateObj)
  const year = parts.find(p => p.type === 'year').value
  const month = parts.find(p => p.type === 'month').value
  const day = parts.find(p => p.type === 'day').value
  const hour = parts.find(p => p.type === 'hour').value
  const minute = parts.find(p => p.type === 'minute').value
  
  return `${year}-${month}-${day}T${hour}:${minute}`
}

// Parse HTML date input (YYYY-MM-DD) to ISO string for database
export const parseInputDate = (inputValue, timezone = getUserTimezone()) => {
  if (!inputValue) return null
  
  console.log('Parsing input date:', inputValue, 'with timezone:', timezone)
  
  // For date-only inputs, we want to preserve the exact date regardless of timezone
  // Create date at noon in the user's timezone to avoid day shifts
  const dateString = `${inputValue}T12:00:00`
  
  // Create a date object in the user's timezone
  const tempDate = new Date(dateString)
  
  // Convert to user's timezone by creating a date that represents noon in their timezone
  const offsetDate = new Date(tempDate.toLocaleString('en-US', { timeZone: timezone }))
  const localOffset = tempDate.getTime() - offsetDate.getTime()
  const correctDate = new Date(tempDate.getTime() + localOffset)
  
  // Set to noon to avoid timezone edge cases
  correctDate.setHours(12, 0, 0, 0)
  
  const result = correctDate.toISOString()
  console.log('Parsed date result:', result)
  
  return result
}

// Simpler approach: parse date input as-is without timezone conversion
export const parseInputDateSimple = (inputValue) => {
  if (!inputValue) return null
  
  console.log('Parsing input date (simple):', inputValue)
  
  // Create date at noon to avoid timezone issues
  const dateString = `${inputValue}T12:00:00.000Z`
  
  console.log('Simple parsed date result:', dateString)
  
  return dateString
}

export const getTimezoneOffset = (timezone) => {
  const now = new Date()
  const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  return (utcTime.getTime() - tzTime.getTime()) / 60000
}

// FIXED: Display date without timezone conversion for date-only values
// Parse the date string correctly to avoid timezone shifts
export const formatDisplayDate = (date, timezone = getUserTimezone()) => {
  if (!date) return ''
  
  console.log('Formatting display date:', date)
  
  const dateStr = date.toString()
  
  // For date-only values stored as YYYY-MM-DDTHH:mm:ss.sssZ
  if (dateStr.includes('T')) {
    // Extract date part (YYYY-MM-DD)
    const datePart = dateStr.split('T')[0]
    const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10))
    
    console.log('Extracted date parts:', { year, month, day })
    
    // Create date using UTC to avoid any timezone conversion
    const dateObj = new Date(Date.UTC(year, month - 1, day))
    
    const result = dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC', // Use UTC to prevent timezone shifts
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    console.log('Display date result:', result)
    return result
  }
  
  // For YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
    const dateObj = new Date(Date.UTC(year, month - 1, day))
    
    return dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Fallback for other date formats
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Display datetime in user's timezone (for actual datetime values, not date-only)
export const formatDisplayDateTime = (date, timezone = getUserTimezone()) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  const userLocale = getUserLocale()
  
  return dateObj.toLocaleString(userLocale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const isToday = (date, timezone = getUserTimezone()) => {
  if (!date) return false
  
  const dateObj = new Date(date)
  const today = new Date()
  
  const dateStr = dateObj.toDateString()
  const todayStr = today.toDateString()
  
  return dateStr === todayStr
}

export const isThisWeek = (date, timezone = getUserTimezone()) => {
  if (!date) return false
  
  const dateObj = new Date(date)
  const today = new Date()
  
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return dateObj >= startOfWeek && dateObj <= endOfWeek
}