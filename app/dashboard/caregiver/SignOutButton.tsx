"use client"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <Button size="sm" variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign Out
    </Button>
  )
}
