import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  salesPages: defineTable({
    userId: v.string(),
    // Input fields
    productName: v.string(),
    productDescription: v.string(),
    keyFeatures: v.array(v.string()),
    targetAudience: v.array(v.string()),
    price: v.array(v.string()),
    uniqueSellingPoints: v.optional(v.string()),
    // Generated content (structured JSON)
    generatedContent: v.optional(
      v.object({
        headline: v.string(),
        subHeadline: v.string(),
        productDescription: v.string(),
        benefits: v.array(
          v.object({ title: v.string(), description: v.string() }),
        ),
        features: v.array(
          v.object({ title: v.string(), description: v.string() }),
        ),
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
      }),
    ),
    templateStyle: v.string(), // "editorial", "minimal", "bold"
    status: v.string(), // "generating", "ready", "error"
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_createdAt", ["userId", "createdAt"]),
});
