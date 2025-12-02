"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Log out
    </Button>
  );
}
