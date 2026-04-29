import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getUserIdOrThrow = async (ctx: QueryCtx): Promise<string> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.tokenIdentifier;
};

const generatedContentValidator = v.object({
  headline: v.string(),
  subHeadline: v.string(),
  productDescription: v.string(),
  benefits: v.array(v.object({ title: v.string(), description: v.string() })),
  features: v.array(v.object({ title: v.string(), description: v.string() })),
  socialProof: v.string(),
  pricingDisplay: v.string(),
  pricingPlans: v.array(
    v.object({
      name: v.string(),
      price: v.string(),
      description: v.string(),
      features: v.array(v.string()),
    }),
  ),
  callToAction: v.string(),
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);
    return await ctx.db
      .query("salesPages")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { id: v.id("salesPages") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) return null;
    return page;
  },
});

// Internal query for AI actions (no auth check — only called server-side)
export const getInternal = internalQuery({
  args: { id: v.id("salesPages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    productName: v.string(),
    productDescription: v.string(),
    keyFeatures: v.array(v.string()),
    targetAudience: v.array(v.string()),
    price: v.array(v.string()),
    uniqueSellingPoints: v.optional(v.string()),
    templateStyle: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const now = Date.now();

    const pageId = await ctx.db.insert("salesPages", {
      userId,
      productName: args.productName,
      productDescription: args.productDescription,
      keyFeatures: args.keyFeatures,
      targetAudience: args.targetAudience,
      price: args.price,
      uniqueSellingPoints: args.uniqueSellingPoints,
      templateStyle: args.templateStyle,
      status: "generating",
      createdAt: now,
      updatedAt: now,
    });

    // Schedule AI generation
    await ctx.scheduler.runAfter(0, internal.ai.generateSalesPage, {
      pageId,
    });

    return pageId;
  },
});

export const remove = mutation({
  args: { id: v.id("salesPages") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) {
      throw new Error("Page not found or unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const regenerate = mutation({
  args: { id: v.id("salesPages") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) {
      throw new Error("Page not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      status: "generating",
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.ai.generateSalesPage, {
      pageId: args.id,
    });
  },
});

export const regenerateSection = mutation({
  args: {
    id: v.id("salesPages"),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) {
      throw new Error("Page not found or unauthorized");
    }

    await ctx.scheduler.runAfter(0, internal.ai.regenerateSection, {
      pageId: args.id,
      section: args.section,
    });
  },
});

export const updateTemplateStyle = mutation({
  args: {
    id: v.id("salesPages"),
    templateStyle: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) {
      throw new Error("Page not found or unauthorized");
    }
    await ctx.db.patch(args.id, {
      templateStyle: args.templateStyle,
      updatedAt: Date.now(),
    });
  },
});

export const updateContent = mutation({
  args: {
    id: v.id("salesPages"),
    generatedContent: generatedContentValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const page = await ctx.db.get(args.id);
    if (!page || page.userId !== userId) {
      throw new Error("Page not found or unauthorized");
    }
    await ctx.db.patch(args.id, {
      generatedContent: args.generatedContent,
      updatedAt: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// Internal mutations (called from actions)
// ---------------------------------------------------------------------------

export const updateGenerated = internalMutation({
  args: {
    pageId: v.id("salesPages"),
    generatedContent: generatedContentValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      generatedContent: args.generatedContent,
      status: "ready",
      updatedAt: Date.now(),
    });
  },
});

export const updateSectionContent = internalMutation({
  args: {
    pageId: v.id("salesPages"),
    generatedContent: generatedContentValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      generatedContent: args.generatedContent,
      updatedAt: Date.now(),
    });
  },
});

export const markError = internalMutation({
  args: {
    pageId: v.id("salesPages"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      status: "error",
      errorMessage: args.error,
      updatedAt: Date.now(),
    });
  },
});
