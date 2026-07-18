import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/components/ui/toast'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { SymptomsPage } from '@/features/symptoms/SymptomsPage'
import { MedicationsPage } from '@/features/medications/MedicationsPage'
import { BloodPressurePage } from '@/features/blood-pressure/BloodPressurePage'
import { FallsPage } from '@/features/falls/FallsPage'
import { QuestionsPage } from '@/features/questions/QuestionsPage'
import { CaregiverPage } from '@/features/caregiver/CaregiverPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AboutPage } from '@/features/about/AboutPage'
import { SupportPage } from '@/features/support/SupportPage'

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/symptoms" element={<SymptomsPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
              <Route path="/blood-pressure" element={<BloodPressurePage />} />
              <Route path="/falls" element={<FallsPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/caregiver-notes" element={<CaregiverPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ToastProvider>
    </SettingsProvider>
  )
}
