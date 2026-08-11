import { useEffect } from "react";
import { getLocalBusinessSchema } from "@/lib/structuredData";

// Injects a single site-wide LocalBusiness JSON-LD block into <head>.
// Uses an id distinct from SEOMeta's per-page structured data so the two
// never clobber each other.
export default function StructuredData() {
  useEffect(() => {
    const id = "ld-localbusiness";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(getLocalBusinessSchema());
  }, []);
  return null;
}
