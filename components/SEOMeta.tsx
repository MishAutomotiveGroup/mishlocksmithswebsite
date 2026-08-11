import { useEffect } from "react";
import { siteContent } from "@/content/siteContent";

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: object;
}

export default function SEOMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  structuredData,
}: SEOMetaProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", ogTitle || title, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", siteContent.business.name, true);
    if (ogImage) setMeta("og:image", ogImage, true);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    if (structuredData) {
      let sd = document.getElementById("structured-data");
      if (!sd) {
        sd = document.createElement("script");
        sd.setAttribute("type", "application/ld+json");
        sd.setAttribute("id", "structured-data");
        document.head.appendChild(sd);
      }
      sd.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, structuredData]);

  return null;
}
