import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useActivityLog } from './useActivityLog'

export function useUserSettings() {
  const [settings, setSettings] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: 'light',
    notifications: true
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { logActivity } = useActivityLog()

  const loadSettings = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_settings_crm_2024')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (data) {
        setSettings({
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          theme: data.theme || 'light',
          notifications: data.notifications !== false
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    if (!user) return

    const oldValue = settings[key]
    const newSettings = { ...settings, [key]: value }

    try {
      // Optimistic update
      setSettings(newSettings)

      const { error } = await supabase
        .from('user_settings_crm_2024')
        .upsert({
          user_id: user.id,
          timezone: newSettings.timezone,
          theme: newSettings.theme,
          notifications: newSettings.notifications,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Log the activity
      await logActivity(
        'update',
        'settings',
        `${key.charAt(0).toUpperCase() + key.slice(1)} changed from "${oldValue}" to "${value}"`,
        { setting: key, old_value: oldValue, new_value: value }
      )
    } catch (error) {
      console.error('Error updating setting:', error)
      // Revert on error
      setSettings(settings)
    }
  }

  const updateTimezone = async (timezone) => {
    await updateSetting('timezone', timezone)
    // Update localStorage for immediate effect
    localStorage.setItem('user-timezone', timezone)
  }

  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      setSettings({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: 'light',
        notifications: true
      })
    }
  }, [user])

  // Update localStorage when timezone changes
  useEffect(() => {
    localStorage.setItem('user-timezone', settings.timezone)
  }, [settings.timezone])

  return {
    settings,
    loading,
    updateSetting,
    updateTimezone,
    loadSettings
  }
}