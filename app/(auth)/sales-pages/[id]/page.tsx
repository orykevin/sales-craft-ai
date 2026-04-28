"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Pencil,
  Sparkles,
} from "lucide-react";
import SalesPagePreview from "@/components/sales/SalesPagePreview";

type SectionName =
  | "headline"
  | "subHeadline"
  | "productDescription"
  | "benefits"
  | "features"
  | "socialProof"
  | "pricingDisplay"
  | "callToAction";

const sectionLabels: Record<SectionName, string> = {
  headline: "Headline",
  subHeadline: "Sub-headline",
  productDescription: "Description",
  benefits: "Benefits",
  features: "Features",
  socialProof: "Social Proof",
  pricingDisplay: "Pricing",
  callToAction: "Call to Action",
};

export default function ViewSalesPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as Id<"salesPages">;

  const page = useQuery(api.salesPages.get, { id: pageId });
  const regeneratePage = useMutation(api.salesPages.regenerate);
  const regenerateSection = useMutation(api.salesPages.regenerateSection);
  const removePage = useMutation(api.salesPages.remove);
  const updateTemplate = useMutation(api.salesPages.updateTemplateStyle);

  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (page === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-neutral-400 text-sm">Loading page...</p>
        </div>
      </div>
    );
  }

  if (page === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-neutral-400 mb-4">Page not found.</p>
        <button
          onClick={() => router.push("/sales-pages")}
          className="text-amber-500 hover:text-amber-400"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regeneratePage({ id: pageId });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateSection = async (section: string) => {
    setRegeneratingSection(section);
    try {
      await regenerateSection({ id: pageId, section });
    } finally {
      // Keep showing regenerating for a moment
      setTimeout(() => setRegeneratingSection(null), 1500);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    setIsDeleting(true);
    try {
      await removePage({ id: pageId });
      router.push("/sales-pages");
    } catch {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (!page.generatedContent) return;
    const html = generateExportHTML(page as ExportablePage);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.productName.toLowerCase().replace(/\s+/g, "-")}-sales-page.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isGenerating = page.status === "generating";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push("/sales-pages")}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pages
          </button>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {page.productName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-neutral-800/50 p-1 bg-neutral-900/50">
            <button
              onClick={() => setMode("preview")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === "preview"
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === "edit"
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/80 disabled:opacity-30 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRegenerating || isGenerating ? "animate-spin" : ""}`}
            />
            Regenerate All
          </button>
          <button
            onClick={handleExport}
            disabled={!page.generatedContent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/80 disabled:opacity-30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800/80 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Template Switcher */}
      {page.generatedContent && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Template:</span>
          {["editorial", "minimal", "bold"].map((style) => (
            <button
              key={style}
              onClick={() =>
                updateTemplate({ id: pageId, templateStyle: style })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                page.templateStyle === style
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-neutral-800/50 text-neutral-400 border border-transparent hover:border-neutral-700"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      )}

      {/* Generating state */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 border border-amber-500/10 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <h3 className="text-lg font-display font-semibold mb-2">
            Generating your sales page...
          </h3>
          <p className="text-neutral-400 text-sm">
            AI is crafting compelling copy for your product. This takes a few
            seconds.
          </p>
        </div>
      )}

      {/* Error state */}
      {page.status === "error" && (
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
          <p className="text-red-400 text-sm mb-3">
            Generation failed: {page.errorMessage || "Unknown error"}
          </p>
          <button
            onClick={handleRegenerate}
            className="text-sm text-amber-500 hover:text-amber-400"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {page.generatedContent && !isGenerating && (
        <>
          {mode === "preview" ? (
            <div className="rounded-2xl overflow-hidden border border-neutral-800/50">
              <SalesPagePreview
                content={page.generatedContent}
                templateStyle={page.templateStyle}
                productName={page.productName}
                price={page.price}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {(Object.keys(sectionLabels) as SectionName[]).map((section) => (
                <div
                  key={section}
                  className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-300">
                      {sectionLabels[section]}
                    </h3>
                    <button
                      onClick={() => handleRegenerateSection(section)}
                      disabled={regeneratingSection === section}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${regeneratingSection === section ? "animate-spin" : ""}`}
                      />
                      {regeneratingSection === section
                        ? "Regenerating..."
                        : "Regenerate"}
                    </button>
                  </div>
                  <div className="text-neutral-300 text-sm leading-relaxed">
                    {renderSectionContent(
                      section,
                      page.generatedContent[section],
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSectionContent(section: string, content: unknown) {
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map(
          (item: { title: string; description: string }, i: number) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-500 font-medium">{item.title}:</span>
              <span className="text-neutral-400">{item.description}</span>
            </li>
          ),
        )}
      </ul>
    );
  }
  return <p className="whitespace-pre-line">{String(content)}</p>;
}

type ExportablePage = {
  productName: string;
  price: string;
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
};

function generateExportHTML(page: ExportablePage): string {
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
    .cta-btn { display: inline-block; margin-top: 2.5rem; padding: 1rem 2.5rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0a0a0a; font-weight: 600; border-radius: 12px; text-decoration: none; font-size: 1rem; transition: transform 0.2s; }
    .cta-btn:hover { transform: translateY(-2px); }
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
  <section><p class="pricing">${c.pricingDisplay}</p></section>
  <div class="final-cta">
    <a href="#" class="cta-btn">${c.callToAction}</a>
  </div>
</body>
</html>`;
}
