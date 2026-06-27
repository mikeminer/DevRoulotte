"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthRecoveryRedirect() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, supabase]);

  return null;
}
