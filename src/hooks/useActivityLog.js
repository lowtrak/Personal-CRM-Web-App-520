import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useActivityLog() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const logActivity = async (action, page, description, metadata = {}) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('activity_log_crm_2024')
        .insert([{
          user_id: user.id,
          user_email: user.email,
          action,
          page,
          description,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        }])

      if (error) {
        console.error('Error logging activity:', error)
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const loadActivities = async (limit = 50) => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activity_log_crm_2024')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error

      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearActivities = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('activity_log_crm_2024')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setActivities([])
      await logActivity('system', 'settings', 'Activity log cleared')
    } catch (error) {
      console.error('Error clearing activities:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadActivities()
    } else {
      setActivities([])
    }
  }, [user])

  return {
    activities,
    loading,
    logActivity,
    loadActivities,
    clearActivities
  }
}