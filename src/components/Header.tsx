import { Link } from '@tanstack/react-router'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

import './Header.css'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <nav className="nav">

      </nav>
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  )
}
