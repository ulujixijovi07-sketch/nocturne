"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VIPRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/deals");
  }, [router]);

  return null;
}
