import {
  LayoutDashboard,
  Activity,
  Pill,
  HeartPulse,
  AlertTriangle,
  HelpCircle,
  Users,
  FileText,
  Settings,
  Info,
  Coffee,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/symptoms', label: 'Symptoms', icon: Activity },
  { to: '/medications', label: 'Medications', icon: Pill },
  { to: '/blood-pressure', label: 'Blood Pressure', icon: HeartPulse },
  { to: '/falls', label: 'Falls', icon: AlertTriangle },
  { to: '/questions', label: 'Questions', icon: HelpCircle },
  { to: '/caregiver-notes', label: 'Caregiver Notes', icon: Users },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
  { to: '/support', label: 'Support', icon: Coffee },
]
