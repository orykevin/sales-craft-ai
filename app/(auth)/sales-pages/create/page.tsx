"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Wand2,
} from "lucide-react";

const templateStyles = [
  {
    id: "editorial",
    name: "Editorial",
    description: "Elegant serif fonts, refined spacing, luxury feel",
    gradient: "from-amber-500/20 to-amber-700/10",
    accent: "border-amber-500/30",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean whitespace, sans-serif, modern simplicity",
    gradient: "from-neutral-400/20 to-neutral-600/10",
    accent: "border-neutral-400/30",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Large type, vivid gradients, high energy",
    gradient: "from-violet-500/20 to-pink-500/10",
    accent: "border-violet-500/30",
  },
];

export default function CreateSalesPage() {
  const createPage = useMutation(api.salesPages.create);
  const router = useRouter();

  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    keyFeatures: [""],
    targetAudience: [""],
    price: [""],
    uniqueSellingPoints: "",
    templateStyle: "editorial",
  });
  const [loading, setLoading] = useState(false);

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((f, i) => (i === index ? value : f)),
    }));
  };

  const addGroup = () => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: [...prev.targetAudience, ""],
      price: [...prev.price, ""],
    }));
  };

  const removeGroup = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index),
      price: prev.price.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const features = formData.keyFeatures.filter((f) => f.trim() !== "");
    if (features.length === 0) return;

    const audiences = formData.targetAudience.filter((a) => a.trim() !== "");
    if (audiences.length === 0) return;

    const prices = formData.price.filter((p) => p.trim() !== "");
    if (prices.length === 0) return;

    setLoading(true);
    try {
      const pageId = await createPage({
        productName: formData.productName,
        productDescription: formData.productDescription,
        keyFeatures: features,
        targetAudience: audiences,
        price: prices,
        uniqueSellingPoints: formData.uniqueSellingPoints || undefined,
        templateStyle: formData.templateStyle,
      });
      router.push(`/sales-pages/${pageId}`);
    } catch (error) {
      console.error("Failed to create sales page:", error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/sales-pages")}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pages
        </button>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Create Sales Page
        </h1>
        <p className="text-neutral-400 mt-1 text-sm">
          Provide your product details and let AI generate compelling sales copy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Product / Service Name <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.productName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, productName: e.target.value }))
            }
            placeholder="e.g., FlowState Pro"
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Description <span className="text-amber-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={formData.productDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                productDescription: e.target.value,
              }))
            }
            placeholder="Describe your product or service in detail..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>

        {/* Key Features (multi-input) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Key Features <span className="text-amber-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.keyFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                {formData.keyFeatures.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1.5 text-sm text-amber-500/70 hover:text-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add feature
            </button>
          </div>
        </div>

        {/* Target Audience & Price — grouped rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-300">
              Target Audience &amp; Price <span className="text-amber-500">*</span>
            </span>
          </div>
          <div className="space-y-3">
            {formData.targetAudience.map((audience, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={audience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetAudience: prev.targetAudience.map((a, i) =>
                        i === index ? e.target.value : a
                      ),
                    }))
                  }
                  placeholder={`Audience ${index + 1} — e.g. SaaS founders`}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <input
                  type="text"
                  value={formData.price[index] ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: prev.price.map((p, i) =>
                        i === index ? e.target.value : p
                      ),
                    }))
                  }
                  placeholder="Price — e.g. $49/mo"
                  className="w-36 px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                {formData.targetAudience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGroup(index)}
                    className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addGroup}
              className="inline-flex items-center gap-1.5 text-sm text-amber-500/70 hover:text-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add audience &amp; price
            </button>
          </div>
        </div>

        {/* Unique Selling Points */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Unique Selling Points{" "}
            <span className="text-neutral-600">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={formData.uniqueSellingPoints}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                uniqueSellingPoints: e.target.value,
              }))
            }
            placeholder="What makes your product stand out from competitors?"
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>

        {/* Template Style */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-300">
            Design Template
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templateStyles.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    templateStyle: template.id,
                  }))
                }
                className={`
                  relative p-5 rounded-2xl border text-left transition-all duration-200
                  ${formData.templateStyle === template.id
                    ? `bg-gradient-to-br ${template.gradient} ${template.accent} shadow-lg`
                    : "bg-neutral-900/30 border-neutral-800/50 hover:border-neutral-700"
                  }
                `}
              >
                {formData.templateStyle === template.id && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400" />
                )}
                <h4 className="font-semibold text-sm">{template.name}</h4>
                <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Sales Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
