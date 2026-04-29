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
  Save,
  Plus,
  X,
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
  | "pricingPlans"
  | "callToAction";

const sectionLabels: Record<SectionName, string> = {
  headline: "Headline",
  subHeadline: "Sub-headline",
  productDescription: "Description",
  benefits: "Benefits",
  features: "Features",
  socialProof: "Social Proof",
  pricingDisplay: "Pricing Intro",
  pricingPlans: "Pricing Plans",
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
  const updateContent = useMutation(api.salesPages.updateContent);

  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveSection = async () => {
    if (!editingSection || !page?.generatedContent) return;
    setIsSaving(true);
    try {
      const newContent = {
        ...page.generatedContent,
        [editingSection]: editValue,
      };
      await updateContent({
        id: pageId,
        generatedContent: newContent as any,
      });
      setEditingSection(null);
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (section: SectionName) => {
    setEditingSection(section);
    setEditValue(JSON.parse(JSON.stringify(page?.generatedContent?.[section])));
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "preview"
                ? "bg-amber-500/10 text-amber-400"
                : "text-neutral-400 hover:text-neutral-200"
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "edit"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${page.templateStyle === style
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
                targetAudience={page.targetAudience}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {(Object.keys(sectionLabels) as SectionName[]).map((section) => {
                const isEditing = editingSection === section;
                return (
                  <div
                    key={section}
                    className={`p-5 rounded-2xl bg-neutral-900/50 border transition-all ${isEditing ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-neutral-800/50 hover:border-neutral-700/50"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-300">
                        {sectionLabels[section]}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => setEditingSection(null)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveSection}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-neutral-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(section)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
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
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-neutral-300 text-sm leading-relaxed">
                      {isEditing ? (
                        <SectionEditor
                          section={section}
                          value={editValue}
                          onChange={setEditValue}
                        />
                      ) : (
                        page.generatedContent && renderSectionContent(
                          section,
                          page.generatedContent[section],
                        )
                      )}
                    </div>
                  </div>
                );
              })}
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
  if (section === "pricingPlans" && Array.isArray(content)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {content.map((plan: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/30">
            <h4 className="font-bold text-amber-400 mb-1">{plan.name}</h4>
            <p className="text-white font-medium mb-1">{plan.price}</p>
            <p className="text-neutral-400 text-xs mb-3">{plan.description}</p>
            <ul className="space-y-1">
              {plan.features.map((f: string, j: number) => (
                <li key={j} className="text-xs text-neutral-500 flex gap-2">
                  <span>•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map(
          (item: any, i: number) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="text-amber-500 font-medium">{item.title}</span>
              <span className="text-neutral-400">{item.description}</span>
            </li>
          ),
        )}
      </ul>
    );
  }

  return <p className="whitespace-pre-line">{String(content)}</p>;
}

function SectionEditor({
  section,
  value,
  onChange,
}: {
  section: SectionName;
  value: any;
  onChange: (val: any) => void;
}) {
  if (section === "pricingPlans" && Array.isArray(value)) {
    return (
      <div className="space-y-4">
        {value.map((plan: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-700/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Plan {i + 1}</span>
              <button
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase font-bold">Name</label>
                <input
                  value={plan.name}
                  onChange={(e) => onChange(value.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase font-bold">Price</label>
                <input
                  value={plan.price}
                  onChange={(e) => onChange(value.map((p, idx) => idx === i ? { ...p, price: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Description</label>
              <textarea
                value={plan.description}
                rows={2}
                onChange={(e) => onChange(value.map((p, idx) => idx === i ? { ...p, description: e.target.value } : p))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Features</label>
              <div className="space-y-2">
                {plan.features.map((f: string, j: number) => (
                  <div key={j} className="flex gap-2">
                    <input
                      value={f}
                      onChange={(e) => onChange(value.map((p: any, idx: number) => idx === i ? {
                        ...p,
                        features: p.features.map((feat: string, fidx: number) => fidx === j ? e.target.value : feat)
                      } : p))}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs focus:border-amber-500/50 outline-none transition-all"
                    />
                    <button
                      onClick={() => onChange(value.map((p: any, idx: number) => idx === i ? {
                        ...p,
                        features: p.features.filter((_: any, fidx: number) => fidx !== j)
                      } : p))}
                      className="p-1.5 text-neutral-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onChange(value.map((p: any, idx: number) => idx === i ? {
                    ...p,
                    features: [...p.features, ""]
                  } : p))}
                  className="text-[10px] text-amber-500 font-bold hover:text-amber-400 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Feature
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...value, { name: "New Plan", price: "$0", description: "", features: [] }])}
          className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Pricing Plan
        </button>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-4">
        {value.map((item: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-neutral-800/20 border border-neutral-700/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Item {i + 1}</span>
              <button
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Title</label>
              <input
                value={item.title}
                onChange={(e) => onChange(value.map((v, idx) => idx === i ? { ...v, title: e.target.value } : v))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Description</label>
              <textarea
                value={item.description}
                rows={2}
                onChange={(e) => onChange(value.map((v, idx) => idx === i ? { ...v, description: e.target.value } : v))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all resize-none"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...value, { title: "", description: "" }])}
          className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
    );
  }

  return (
    <textarea
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-500/50 outline-none transition-all resize-none"
    />
  );
}

type ExportablePage = {
  productName: string;
  templateStyle: string;
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
    pricingPlans: Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
    }>;
    callToAction: string;
  };
};

function generateExportHTML(page: ExportablePage): string {
  const c = page.generatedContent;
  const s = page.templateStyle;

  // Define theme-specific styles
  let themeStyles = "";
  if (s === "minimal") {
    themeStyles = `
      body { background: #0c0c0c; color: #f5f5f5; }
      .hero { background: #0c0c0c; min-height: 75vh; }
      h1 { font-family: sans-serif; font-weight: 700; letter-spacing: -0.02em; }
      .sub { font-weight: 300; letter-spacing: 0.05em; color: #a3a3a3; }
      .cta-btn { background: #fff; color: #0c0c0c; border-radius: 100px; font-size: 0.875rem; letter-spacing: 0.05em; text-transform: uppercase; }
      .section-title { font-family: sans-serif; }
      .card { background: transparent; border-color: #262626; border-radius: 12px; }
      .card-icon { background: #262626; color: #fff; }
      .feature-card { border-left-color: #404040; }
      .feature-card:hover { border-left-color: #fff; }
      .feature-card h3 { color: #fff; }
      .quote-wrapper { border-color: #262626; }
      .quote-icon { color: #525252; }
      .quote-text { font-family: serif; color: #d4d4d4; }
      .pricing-card { background: #171717; border-color: #262626; border-radius: 16px; }
      .plan-name { color: #fff; text-transform: uppercase; letter-spacing: 0.1em; }
      .plan-price { color: #fff; }
      .plan-button { background: #fff; color: #000; border-radius: 8px; }
      .check-icon { color: #fff; }
    `;
  } else if (s === "bold") {
    themeStyles = `
      body { background: #0a0014; color: #fff; }
      .hero { background: linear-gradient(180deg, #1e003c 0%, #0a0014 100%); min-height: 80vh; }
      h1 { font-family: sans-serif; font-weight: 900; background: linear-gradient(to right, #c4b5fd, #f9a8d4, #fde68a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .sub { color: rgba(221, 214, 254, 0.7); }
      .cta-btn { background: linear-gradient(to right, #8b5cf6, #ec4899); color: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3); }
      .section-title { font-weight: 900; background: linear-gradient(to right, #c4b5fd, #f9a8d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .card { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05)); border-color: rgba(139, 92, 246, 0.2); border-radius: 24px; }
      .card-icon { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); color: #ddd6fe; }
      .feature-card { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 16px; border-left-width: 1px; }
      .feature-card:hover { background: rgba(139, 92, 246, 0.1); }
      .feature-card h3 { color: #ddd6fe; }
      .quote-wrapper { border-color: rgba(139, 92, 246, 0.2); }
      .quote-icon { background: linear-gradient(to right, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 6rem; }
      .quote-text { color: rgba(237, 233, 254, 0.8); font-size: 1.5rem; }
      .pricing-card { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border-color: rgba(139, 92, 246, 0.2); border-radius: 32px; }
      .plan-name { color: #fff; font-weight: 900; }
      .plan-price { background: linear-gradient(to right, #c4b5fd, #f9a8d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .plan-button { background: linear-gradient(to right, #8b5cf6, #ec4899); color: #fff; border-radius: 12px; }
      .check-icon { color: #f472b6; }
    `;
  } else {
    // editorial
    themeStyles = `
      body { background: #0a0a0a; color: #f5f5f5; }
      .hero { background: linear-gradient(180deg, #0a0a0a 0%, #1a1000 100%); }
      h1 { font-family: 'Playfair Display', serif; }
      .cta-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: #0a0a0a; border-radius: 12px; }
      .section-title { font-family: 'Playfair Display', serif; }
      .card { background: rgba(255,255,255,0.02); border-color: rgba(245,158,11,0.1); }
      .card-icon { background: rgba(245,158,11,0.1); color: #f59e0b; }
      .feature-card { border-left-color: rgba(245,158,11,0.2); }
      .feature-card:hover { border-left-color: #f59e0b; }
      .feature-card h3 { color: #f59e0b; }
      .quote-wrapper { border-color: rgba(245,158,11,0.1); }
      .quote-icon { color: rgba(245,158,11,0.3); }
      .quote-text { font-family: 'Playfair Display', serif; }
      .pricing-card { background: rgba(23, 23, 23, 0.5); border-color: rgba(245, 158, 11, 0.1); }
      .plan-name { color: #fef3c7; font-family: 'Playfair Display', serif; }
      .plan-price { background: linear-gradient(to right, #fbbf24, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .plan-button { background: linear-gradient(to right, #f59e0b, #d97706); color: #000; border-radius: 12px; }
      .check-icon { color: #f59e0b; }
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.headline} — ${page.productName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.5; }
    .hero { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; }
    h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.1; max-width: 900px; margin: 0 auto; }
    .sub { font-size: 1.25rem; margin-top: 1.5rem; max-width: 650px; line-height: 1.6; }
    .cta-btn { display: inline-block; margin-top: 2.5rem; padding: 1rem 2.5rem; font-weight: 600; text-decoration: none; font-size: 1rem; transition: all 0.2s; border: 0; cursor: pointer; }
    .cta-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
    section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
    .section-title { font-size: 2.5rem; margin-bottom: 3.5rem; text-align: center; letter-spacing: -0.01em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem; }
    .card { padding: 2.5rem; border: 1px solid; border-radius: 24px; transition: all 0.3s; }
    .card-icon { font-size: 1.5rem; margin-bottom: 1.5rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
    .card h3 { font-size: 1.25rem; margin-bottom: 1rem; }
    .card p { font-size: 1rem; line-height: 1.6; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
    .feature-card { padding: 2rem; border-left: 2px solid; transition: all 0.3s; }
    .feature-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
    .feature-card p { font-size: 0.95rem; line-height: 1.6; }
    .desc { font-size: 1.25rem; line-height: 1.8; text-align: center; white-space: pre-line; max-width: 850px; margin: 0 auto; }
    .quote-wrapper { max-width: 850px; margin: 0 auto; text-align: center; padding: 5rem 0; border-top: 1px solid; border-bottom: 1px solid; }
    .quote-icon { font-size: 4rem; line-height: 1; margin-bottom: 1.5rem; }
    .quote-text { font-style: italic; font-size: 1.5rem; line-height: 1.6; }
    .pricing-intro { text-align: center; font-size: 1.25rem; margin-bottom: 3.5rem; opacity: 0.8; }
    .pricing-grid { display: grid; gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .pricing-card { display: flex; flex-direction: column; padding: 3rem; border: 1px solid; }
    .plan-header { margin-bottom: 2rem; }
    .plan-name { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; }
    .plan-target { font-size: 0.75rem; opacity: 0.5; margin-top: 0.5rem; text-transform: uppercase; }
    .plan-price-wrapper { margin-bottom: 1.5rem; }
    .plan-price { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.02em; }
    .plan-desc { font-size: 1rem; opacity: 0.7; line-height: 1.6; margin-bottom: 2.5rem; }
    .plan-features { list-style: none; margin-top: auto; margin-bottom: 2.5rem; padding: 0; }
    .plan-feature { font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: start; gap: 0.75rem; }
    .check-icon { font-weight: bold; }
    .plan-button { margin-top: 0; width: 100%; text-align: center; padding: 1rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .final-cta { text-align: center; padding: 7rem 2rem; }
    
    ${themeStyles}
    
    @media (max-width: 768px) {
      .pricing-grid { grid-template-columns: 1fr !important; }
      h1 { font-size: 2.5rem; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${c.headline}</h1>
    <p class="sub">${c.subHeadline}</p>
    <a href="#" class="cta-btn">${c.callToAction}</a>
  </div>
  
  <section>
    <p class="desc">${c.productDescription}</p>
  </section>
  
  <section>
    <h2 class="section-title">Why Choose ${page.productName}?</h2>
    <div class="grid">
      ${c.benefits.map((b, i) => `
        <div class="card">
          <div class="card-icon">${["✦", "◈", "⬡", "◇", "△", "○"][i % 6]}</div>
          <h3>${b.title}</h3>
          <p>${b.description}</p>
        </div>
      `).join("")}
    </div>
  </section>
  
  <section>
    <h2 class="section-title">Powerful Features</h2>
    <div class="feature-grid">
      ${c.features.map((f) => `
        <div class="feature-card">
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>
      `).join("")}
    </div>
  </section>
  
  <section>
    <div class="quote-wrapper">
      <div class="quote-icon">&ldquo;</div>
      <p class="quote-text">${c.socialProof}</p>
    </div>
  </section>
  
  <section>
    <p class="pricing-intro">${c.pricingDisplay}</p>
    <div class="pricing-grid" style="grid-template-columns: ${c.pricingPlans.length > 1 && c.pricingPlans.length % 2 === 0 ? "repeat(2, 1fr)" : c.pricingPlans.length > 1 && c.pricingPlans.length % 3 === 0 ? "repeat(3, 1fr)" : "1fr"};">
      ${c.pricingPlans?.map((plan, i) => `
        <div class="pricing-card">
          <div class="plan-header">
            <h3 class="plan-name">${plan.name}</h3>
            <p class="plan-target">${page.targetAudience[i] || ""}</p>
          </div>
          <div class="plan-price-wrapper">
            <span class="plan-price">${plan.price}</span>
          </div>
          <p class="plan-desc">${plan.description}</p>
          <ul class="plan-features">
            ${plan.features.map((f) => `
              <li class="plan-feature">
                <span class="check-icon">✓</span>
                <span>${f}</span>
              </li>
            `).join("")}
          </ul>
          <a href="#" class="plan-button">Get Started</a>
        </div>
      `).join("")}
    </div>
  </section>
  
  <div class="final-cta">
    <h2 class="section-title">Ready to Transform Your Workflow?</h2>
    <a href="#" class="cta-btn">${c.callToAction}</a>
  </div>
</body>
</html>`;
}
