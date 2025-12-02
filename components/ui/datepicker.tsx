"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  label = "Date of birth",
  id = "date",
  className,
}: {
  value?: string
  onChange?: (value: string) => void
  label?: string
  id?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  return (
    <div className={"flex flex-col gap-3 " + (className || "") }>
      <Label htmlFor={id} className="px-1">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className="w-full justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : value || "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
              if (date && onChange) {
                // Store as ISO string (date-only)
                const iso = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
                onChange(iso)
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
