"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  Settings,
  LogOut,
  Eye
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dock, DockIcon } from "@/components/ui/dock"
import { Separator } from "@/components/ui/separator"
import { signOut } from "next-auth/react"

const NAV_ITEMS = [
  { href: "/dashboard/caregiver", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/caregiver/routines", icon: Calendar, label: "Routines" },
  { href: "/dashboard/caregiver/lessons", icon: BookOpen, label: "Lessons" },
  { href: "/dashboard/caregiver/carees", icon: Users, label: "Carees" },
  { href: "https://autism-simulator-b3ju.vercel.app/", icon: Eye, label: "Autism Simulation", external: true },
]

export default function CaregiverDockMenu() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <TooltipProvider>
        <Dock direction="middle" className="bg-white/80 border-black/10 shadow-lg shadow-black/5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard/caregiver" && !item.external && pathname.startsWith(item.href))
            
            const linkProps = item.external 
              ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: item.href }
            
            return (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      {...linkProps}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full transition-colors",
                        isActive 
                          ? "bg-black text-white hover:bg-black hover:text-white" 
                          : "text-black/60 hover:text-black hover:bg-black/5"
                      )}
                    >
                      <item.icon className="size-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            )
          })}
          
          <Separator orientation="vertical" className="h-8 bg-black/10" />
          
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  aria-label="Sign Out"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 rounded-full text-black/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                  )}
                >
                  <LogOut className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  )
}
