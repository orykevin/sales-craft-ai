"use client";

import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PlusCircle,
  Trash2,
  Eye,
  Download,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function SalesPages() {
  const pages = useQuery(api.salesPages.list);
  const removePage = useMutation(api.salesPages.remove);
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: Id<"salesPages">) => {
    setDeletingId(id);
    try {
      await removePage({ id });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = (page: NonNullable<typeof pages>[number]) => {
    if (!page.generatedContent) return;
    const html = generateExportHTML(page);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.productName.toLowerCase().replace(/\s+/g, "-")}-sales-page.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "generating":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ready
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  if (pages === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-neutral-400 text-sm">Loading your pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            My Sales Pages
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {pages.length} page{pages.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link
          href="/sales-pages/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
        >
          <PlusCircle className="w-4 h-4" />
          Create New
        </Link>
      </div>

      {/* Empty state */}
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-800 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-amber-500/60" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">
            No sales pages yet
          </h3>
          <p className="text-neutral-400 text-sm mb-8 max-w-md text-center">
            Create your first AI-powered sales page in seconds. Just describe
            your product and let AI craft compelling copy.
          </p>
          <Link
            href="/sales-pages/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Create Your First Page
          </Link>
        </div>
      ) : (
        /* Pages grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pages.map((page) => (
            <div
              key={page._id}
              className="group bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6 hover:border-amber-500/20 hover:bg-neutral-900/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-lg truncate">
                    {page.productName}
                  </h3>
                  <p className="text-neutral-500 text-xs flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(page.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {statusBadge(page.status)}
              </div>

              <p className="text-neutral-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                {page.productDescription}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-400 text-xs capitalize">
                  {page.templateStyle}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-400 text-xs">
                  {page.price.length > 1
                    ? `${page.price[0]} + ${page.price.length - 1} more`
                    : page.price[0] || "No price"}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-neutral-800/50">
                <button
                  onClick={() => router.push(`/sales-pages/${page._id}`)}
                  disabled={page.status !== "ready"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  onClick={() => handleExport(page)}
                  disabled={page.status !== "ready"}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(page._id)}
                  disabled={deletingId === page._id}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-800/80 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                >
                  {deletingId === page._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HTML export helper
// ---------------------------------------------------------------------------

function generateExportHTML(page: {
  productName: string;
  price: string[];
  targetAudience: string[];
  generatedContent: {
    headline: string;
    subHeadline: string;
    productDescription: string;
    benefits: Array<{ title: string; description: string }>;
    features: Array<{ title: string; description: string }>;
    socialProof: string;
    pricingDisplay: string;
    callToAction: string;
  };
}): string {
  const c = page.generatedContent;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.headline} — ${page.productName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #f5f5f5; }
    .hero { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: linear-gradient(180deg, #0a0a0a 0%, #1a1000 100%); }
    h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; line-height: 1.1; max-width: 800px; }
    .sub { font-size: 1.25rem; color: #a3a3a3; margin-top: 1.5rem; max-width: 600px; }
    .cta-btn { display: inline-block; margin-top: 2.5rem; padding: 1rem 2.5rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0a0a0a; font-weight: 600; border-radius: 12px; text-decoration: none; font-size: 1rem; }
    section { padding: 5rem 2rem; max-width: 1000px; margin: 0 auto; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
    .card { padding: 2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(245,158,11,0.1); border-radius: 16px; }
    .card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: #f59e0b; }
    .card p { color: #a3a3a3; font-size: 0.95rem; line-height: 1.6; }
    .desc { font-size: 1.1rem; line-height: 1.8; color: #d4d4d4; text-align: center; white-space: pre-line; }
    .quote { font-style: italic; font-size: 1.1rem; color: #a3a3a3; text-align: center; padding: 3rem; border-top: 1px solid rgba(245,158,11,0.1); border-bottom: 1px solid rgba(245,158,11,0.1); }
    .pricing { text-align: center; font-size: 1.25rem; color: #d4d4d4; }
    .final-cta { text-align: center; padding: 5rem 2rem; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${c.headline}</h1>
    <p class="sub">${c.subHeadline}</p>
    <a href="#" class="cta-btn">${c.callToAction}</a>
  </div>
  <section><p class="desc">${c.productDescription}</p></section>
  <section>
    <h2 class="section-title">Benefits</h2>
    <div class="grid">${c.benefits.map((b) => `<div class="card"><h3>${b.title}</h3><p>${b.description}</p></div>`).join("")}</div>
  </section>
  <section>
    <h2 class="section-title">Features</h2>
    <div class="grid">${c.features.map((f) => `<div class="card"><h3>${f.title}</h3><p>${f.description}</p></div>`).join("")}</div>
  </section>
  <section><p class="quote">"${c.socialProof}"</p></section>
  <section>
    <p class="pricing">${c.pricingDisplay}</p>
    <div style="margin-top: 2rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem;">
      ${page.price.map((p, i) => `
        <div style="display: flex; flex-direction: column; align-items: center;">
          ${page.targetAudience[i] ? `<span style="font-size: 0.875rem; color: #a3a3a3; margin-bottom: 0.5rem;">${page.targetAudience[i]}</span>` : ""}
          <span style="font-size: 2.5rem; font-weight: 700; color: #f59e0b;">${p}</span>
        </div>
      `).join("")}
    </div>
  </section>
  <div class="final-cta">
    <a href="#" class="cta-btn">${c.callToAction}</a>
  </div>
</body>
</html>`;
}
