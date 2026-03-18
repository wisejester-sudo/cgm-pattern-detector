"use client"

import {
  ProfileSection,
  CompanySettingsSection,
  TemplatesSection,
  JobTypesSection,
} from "./components"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, company, and SMS templates
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <ProfileSection />
        <CompanySettingsSection />
        <TemplatesSection />
        <JobTypesSection />
      </div>
    </div>
  )
}
