"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema for structured AI output
// ---------------------------------------------------------------------------

const salesPageSchema = z.object({
  headline: z
    .string()
    .describe("A compelling, attention-grabbing headline (5-12 words)"),
  subHeadline: z
    .string()
    .describe(
      "A supporting sub-headline that expands on the headline (10-20 words)",
    ),
  productDescription: z
    .string()
    .describe(
      "A persuasive, benefit-driven product description (2-3 paragraphs, use line breaks)",
    ),
  benefits: z
    .array(
      z.object({
        title: z.string().describe("Short benefit title (2-5 words)"),
        description: z
          .string()
          .describe("Benefit explanation (1-2 sentences)"),
      }),
    )
    .describe("4-6 key benefits of the product"),
  features: z
    .array(
      z.object({
        title: z.string().describe("Feature name (2-5 words)"),
        description: z.string().describe("Feature explanation (1-2 sentences)"),
      }),
    )
    .describe("4-6 detailed features"),
  socialProof: z
    .string()
    .describe(
      "A realistic-sounding testimonial quote with name and role, or a social proof statement",
    ),
  pricingDisplay: z
    .string()
    .describe(
      "A brief introductory text for the pricing section (1 sentence)",
    ),
  pricingPlans: z
    .array(
      z.object({
        name: z.string().describe("Name of the plan (e.g., 'Starter', 'Pro', 'Founder's Edition')"),
        price: z.string().describe("The exact price string from the input"),
        description: z.string().describe("A 1-sentence description tailored to the specific target audience for this plan"),
        features: z.array(z.string()).describe("3-4 specific features or benefits included in this plan"),
      })
    )
    .describe("Specific pricing plans matching the input price and target audience pairs"),
  callToAction: z
    .string()
    .describe(
      "A compelling call-to-action button text (2-5 words, action-oriented)",
    ),
});

// ---------------------------------------------------------------------------
// Generate full sales page
// ---------------------------------------------------------------------------

export const generateSalesPage = internalAction({
  args: { pageId: v.id("salesPages") },
  handler: async (ctx, args) => {
    // Read the page data
    const page = await ctx.runQuery(internal.salesPages.getInternal, {
      id: args.pageId,
    });
    if (!page) {
      await ctx.runMutation(internal.salesPages.markError, {
        pageId: args.pageId,
        error: "Page not found",
      });
      return;
    }

    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: salesPageSchema,
        prompt: buildPrompt(page),
      });

      await ctx.runMutation(internal.salesPages.updateGenerated, {
        pageId: args.pageId,
        generatedContent: object,
      });
    } catch (error) {
      await ctx.runMutation(internal.salesPages.markError, {
        pageId: args.pageId,
        error: error instanceof Error ? error.message : "AI generation failed",
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Regenerate a single section
// ---------------------------------------------------------------------------

export const regenerateSection = internalAction({
  args: {
    pageId: v.id("salesPages"),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    const page = await ctx.runQuery(internal.salesPages.getInternal, {
      id: args.pageId,
    });
    if (!page || !page.generatedContent) return;

    const { generatedContent } = page;

    try {
      const sectionSchema = getSectionSchema(args.section);
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: sectionSchema,
        prompt: buildSectionPrompt(
          { ...page, generatedContent },
          args.section,
        ),
      });

      // Merge updated section into existing content
      const updatedContent = {
        ...generatedContent,
        ...object,
      };

      await ctx.runMutation(internal.salesPages.updateSectionContent, {
        pageId: args.pageId,
        generatedContent: updatedContent,
      });
    } catch (error) {
      console.error("Section regeneration failed:", error);
    }
  },
});

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildPrompt(page: {
  productName: string;
  productDescription: string;
  keyFeatures: string[];
  targetAudience: string[];
  price: string[];
  uniqueSellingPoints?: string;
}): string {
  return `You are an expert copywriter and marketing strategist. Generate a complete, persuasive sales page for the following product/service.

PRODUCT DETAILS:
- Name: ${page.productName}
- Description: ${page.productDescription}
- Key Features: ${page.keyFeatures.join(", ")}
- Target Audience: ${page.targetAudience.join(", ")}
- Pricing: ${page.price.join(", ")}
${page.uniqueSellingPoints ? `- Unique Selling Points: ${page.uniqueSellingPoints}` : ""}

GUIDELINES:
- Write compelling, benefit-focused copy that speaks directly to the target audience
- Use power words and emotional triggers
- Make the headline irresistible and curiosity-inducing
- Each benefit should emphasize transformation and outcome, not just features
- The call-to-action should create urgency without being pushy
- The social proof should sound authentic and relatable
- For PRICING PLANS: Generate exactly ONE plan for each pair of Target Audience and Price provided above. The plan 'name' should be creative but clear, and the 'description' must specifically mention how it solves the needs of that specific target audience.
- The pricingDisplay should be a high-level hook for the section, not just stating the prices.
- Use professional, persuasive tone throughout`;
}

function buildSectionPrompt(
  page: {
    productName: string;
    productDescription: string;
    keyFeatures: string[];
    targetAudience: string[];
    price: string[];
    uniqueSellingPoints?: string;
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
  },
  section: string,
): string {
  return `You are an expert copywriter. Regenerate ONLY the "${section}" section for this product's sales page. Make it different and even more compelling than the current version.

PRODUCT: ${page.productName}
DESCRIPTION: ${page.productDescription}
TARGET AUDIENCE: ${page.targetAudience.join(", ")}
PRICE: ${page.price.join(", ")}
KEY FEATURES: ${page.keyFeatures.join(", ")}
${page.uniqueSellingPoints ? `USPs: ${page.uniqueSellingPoints}` : ""}

CURRENT ${section.toUpperCase()}: ${JSON.stringify(page.generatedContent[section as keyof typeof page.generatedContent])}

Generate a fresh, improved version of this section. Make it more compelling and engaging.`;
}

// ---------------------------------------------------------------------------
// Section-specific schemas
// ---------------------------------------------------------------------------

function getSectionSchema(section: string): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemas: Record<string, z.ZodObject<Record<string, z.ZodTypeAny>>> = {
    headline: z.object({ headline: z.string() }),
    subHeadline: z.object({ subHeadline: z.string() }),
    productDescription: z.object({ productDescription: z.string() }),
    benefits: z.object({
      benefits: z.array(
        z.object({ title: z.string(), description: z.string() }),
      ),
    }),
    features: z.object({
      features: z.array(
        z.object({ title: z.string(), description: z.string() }),
      ),
    }),
    socialProof: z.object({ socialProof: z.string() }),
    pricingDisplay: z.object({ pricingDisplay: z.string() }),
    pricingPlans: z.object({
      pricingPlans: z.array(
        z.object({
          name: z.string(),
          price: z.string(),
          description: z.string(),
          features: z.array(z.string()),
        }),
      ),
    }),
    callToAction: z.object({ callToAction: z.string() }),
  };

  return schemas[section] || z.object({ [section]: z.string() });
}
