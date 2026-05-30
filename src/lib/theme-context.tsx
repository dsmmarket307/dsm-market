'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Theme = 'dark' | 'light'
type FontSize = 'small' | 'normal' | 'large' | 'xlarge'
type AccentColor = 'gold' | 'blue' | 'green'
type Language = 'es' | 'en'

interface Preferences {
  theme: Theme
  fontSize: FontSize
  accentColor: AccentColor
  language: Language
  notifEmails: boolean
  notifPromos: boolean
  notifNovedades: boolean
  notifSoporte: boolean
  notifRecordatorios: boolean
}

interface ThemeContextType extends Preferences {
  toggleTheme: () => void
  setFontSize: (s: FontSize) => void
  setAccentColor: (c: AccentColor) => void
  setLanguage: (l: Language) => void
  setNotif: (key: keyof Notifications, val: boolean) => void
  savePreferences: (prefs: Partial<Preferences>) => Promise<void>
  accentHex: string
}

interface Notifications {
  notifEmails: boolean
  notifPromos: boolean
  notifNovedades: boolean
  notifSoporte: boolean
  notifRecordatorios: boolean
}

const ACCENT_HEX: Record<AccentColor, string> = {
  gold:  '#D4AF37',
  blue:  '#3B82F6',
  green: '#10B981',
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small:  '13px',
  normal: '15px',
  large:  '17px',
  xlarge: '20px',
}

const DEFAULT_PREFS: Preferences = {
  theme:               'dark',
  fontSize:            'normal',
  accentColor:         'gold',
  language:            'es',
  notifEmails:         true,
  notifPromos:         true,
  notifNovedades:      true,
  notifSoporte:        true,
  notifRecordatorios:  true,
}

const ThemeContext = createContext<ThemeContextType>({
  ...DEFAULT_PREFS,
  toggleTheme:      () => {},
  setFontSize:      () => {},
  setAccentColor:   () => {},
  setLanguage:      () => {},
  setNotif:         () => {},
  savePreferences:  async () => {},
  accentHex:        '#D4AF37',
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)
  const supabase = createClient()

  // Cargar preferencias al montar
  useEffect(() => {
    async function load() {
      // 1. localStorage como fallback inmediato
      try {
        const saved = localStorage.getItem('dms-prefs')
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<Preferences>
          setPrefs(p => ({ ...p, ...parsed }))
        } else {
          // compatibilidad con clave anterior
          const oldTheme = localStorage.getItem('dms-theme') as Theme
          if (oldTheme === 'light' || oldTheme === 'dark') {
            setPrefs(p => ({ ...p, theme: oldTheme }))
          }
        }
      } catch {}

      // 2. Supabase como fuente de verdad
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (data) {
          const fromDb: Partial<Preferences> = {
            theme:               data.theme,
            fontSize:            data.font_size,
            accentColor:         data.accent_color,
            language:            data.language,
            notifEmails:         data.notif_emails,
            notifPromos:         data.notif_promos,
            notifNovedades:      data.notif_novedades,
            notifSoporte:        data.notif_soporte,
            notifRecordatorios:  data.notif_recordatorios,
          }
          setPrefs(p => ({ ...p, ...fromDb }))
          localStorage.setItem('dms-prefs', JSON.stringify(fromDb))
        }
      } catch {}
    }
    load()
  }, [])

  // Aplicar fontSize al root
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[prefs.fontSize]
  }, [prefs.fontSize])

  const savePreferences = async (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial }
    setPrefs(next)
    localStorage.setItem('dms-prefs', JSON.stringify(next))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('user_preferences').upsert({
        user_id:             user.id,
        theme:               next.theme,
        font_size:           next.fontSize,
        accent_color:        next.accentColor,
        language:            next.language,
        notif_emails:        next.notifEmails,
        notif_promos:        next.notifPromos,
        notif_novedades:     next.notifNovedades,
        notif_soporte:       next.notifSoporte,
        notif_recordatorios: next.notifRecordatorios,
      }, { onConflict: 'user_id' })
    } catch {}
  }

  const toggleTheme = () => savePreferences({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })
  const setFontSize = (fontSize: FontSize) => savePreferences({ fontSize })
  const setAccentColor = (accentColor: AccentColor) => savePreferences({ accentColor })
  const setLanguage = (language: Language) => savePreferences({ language })
  const setNotif = (key: keyof Notifications, val: boolean) => savePreferences({ [key]: val } as Partial<Preferences>)

  return (
    <ThemeContext.Provider value={{
      ...prefs,
      toggleTheme,
      setFontSize,
      setAccentColor,
      setLanguage,
      setNotif,
      savePreferences,
      accentHex: ACCENT_HEX[prefs.accentColor],
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export type { Theme, FontSize, AccentColor, Language, Preferences }
