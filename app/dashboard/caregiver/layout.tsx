"use client"

import CaregiverDockMenu from "./components/CaregiverDockMenu"
import { SeizureAlertPopup } from "@/components/seizure-alert-popup"

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
      <CaregiverDockMenu />
      <SeizureAlertPopup />
    </div>
  )
}
