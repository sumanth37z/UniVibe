"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FlashToast({
  message,
  param,
}: {
  message: string;
  param: string;
}) {
  const router = useRouter();
  useEffect(() => {
    if (message) {
      toast.success(message);
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      router.replace(url.pathname + (url.search ? url.search : ""), { scroll: false });
    }
  }, [message, param, router]);
  return null;
}
