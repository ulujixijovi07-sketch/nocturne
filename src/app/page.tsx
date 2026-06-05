import { redirect } from "next/navigation";

/**
 * Root-level page — redirects to the default locale.
 * The middleware also handles locale detection, but this
 * catches any direct visits to `/`.
 */
export default function RootPage() {
  redirect("/en");
}
