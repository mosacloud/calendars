import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/");
  }, [router]);

  return null;
}
