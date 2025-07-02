import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'solo-crm-sidebar-open'

export function useSidebar() {
  // Initialize from localStorage, default to false for mobile-first approach
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored === null) {
      // Default behavior: open on desktop, closed on mobile
      return window.innerWidth >= 1024
    }
    return stored === 'true'
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, isOpen.toString())
  }, [isOpen])

  // Handle window resize to auto-open on desktop if not explicitly closed
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      
      // Only auto-open on desktop if no explicit preference is stored
      if (isDesktop && stored === null) {
        setIsOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle = () => {
    setIsOpen(prev => !prev)
  }

  return { isOpen, toggle }
}