"use client";

interface GeneratedContent {
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
}

interface SalesPagePreviewProps {
  content: GeneratedContent;
  templateStyle: string;
  productName: string;
  price: string[];
  targetAudience: string[];
}

export default function SalesPagePreview({
  content,
  templateStyle,
  productName,
  targetAudience,
}: SalesPagePreviewProps) {
  const styles = getTemplateStyles(templateStyle);

  return (
    <div className={styles.wrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className={styles.headline}>{content.headline}</h1>
          <p className={styles.subHeadline}>{content.subHeadline}</p>
          <button className={styles.ctaButton}>{content.callToAction}</button>
        </div>
      </section>

      {/* Product Description */}
      <section className={styles.section}>
        <div className="max-w-3xl mx-auto">
          <p className={styles.description}>{content.productDescription}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Choose {productName}?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {content.benefits.map((benefit, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>{getIcon(i)}</div>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.cardDesc}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {content.features.map((feature, i) => (
            <div key={i} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className={styles.section}>
        <div className={styles.quoteWrapper}>
          <div className={styles.quoteIcon}>&ldquo;</div>
          <p className={styles.quote}>{content.socialProof}</p>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section}>
        <div className={styles.pricingWrapper}>
          <h2 className={styles.sectionTitle}>Invest in Your Success</h2>
          <p className={styles.pricingIntro}>{content.pricingDisplay}</p>

          <div className={`mt-12 grid gap-8 max-w-6xl mx-auto ${content.pricingPlans.length > 1 && content.pricingPlans.length % 2 === 0 ? "grid-cols-2" : content.pricingPlans.length > 1 && content.pricingPlans.length % 3 === 0 ? "grid-cols-3" : "grid-cols-1"}`}>
            {content.pricingPlans?.map((plan, i) => (
              <div key={i} className={styles.pricingCard}>
                <div className="mb-6">
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planTarget}>{targetAudience[i]}</p>
                </div>

                <div className="mb-6">
                  <span className={styles.planPrice}>{plan.price}</span>
                </div>

                <p className={styles.planDesc}>{plan.description}</p>

                <div className="mt-8 space-y-3 mb-10">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className={styles.checkIcon}>✓</span>
                      <span className={styles.featureText}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={styles.planButton}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>Ready to Get Started?</h2>
        <button className={styles.ctaButton}>{content.callToAction}</button>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template Styles
// ---------------------------------------------------------------------------

function getTemplateStyles(template: string) {
  switch (template) {
    case "minimal":
      return {
        wrapper: "bg-[#0c0c0c] text-neutral-100",
        hero: "min-h-[75vh] flex items-center justify-center py-24 bg-[#0c0c0c]",
        headline:
          "text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white font-sans",
        subHeadline:
          "text-lg md:text-xl text-neutral-400 mt-6 max-w-xl mx-auto font-light tracking-wide",
        ctaButton:
          "inline-block mt-10 px-8 py-4 rounded-full bg-white text-[#0c0c0c] font-semibold text-sm tracking-wide hover:bg-neutral-200 transition-all cursor-pointer border-0",
        section: "py-20 px-6",
        sectionTitle:
          "text-3xl font-bold tracking-tight text-center mb-12 text-white",
        description:
          "text-lg text-neutral-300 leading-relaxed text-center whitespace-pre-line",
        card: "p-8 bg-transparent border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all duration-300",
        cardIcon:
          "text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800",
        cardTitle: "text-base font-semibold mb-2 text-white",
        cardDesc: "text-sm text-neutral-400 leading-relaxed",
        featureCard:
          "p-6 bg-transparent border-l-2 border-neutral-700 hover:border-white transition-all duration-300",
        featureTitle: "text-base font-semibold mb-1 text-white",
        featureDesc: "text-sm text-neutral-400 leading-relaxed",
        quoteWrapper:
          "max-w-3xl mx-auto text-center py-12 border-t border-b border-neutral-800",
        quoteIcon: "text-5xl text-neutral-600 font-serif",
        quote:
          "text-lg text-neutral-300 italic mt-4 leading-relaxed",
        pricingWrapper: "max-w-6xl mx-auto",
        pricingIntro: "text-lg text-neutral-400 mt-4 text-center max-w-2xl mx-auto",
        pricingCard: "p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col hover:border-neutral-700 transition-all duration-300",
        planName: "text-sm font-bold tracking-widest uppercase text-white",
        planTarget: "text-xs text-neutral-500 mt-1",
        planPrice: "text-4xl font-bold text-white",
        planDesc: "text-sm text-neutral-400 leading-relaxed",
        checkIcon: "text-white text-sm mt-0.5",
        featureText: "text-sm text-neutral-300",
        planButton: "mt-auto w-full py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors border-0",
        finalCta: "py-24 px-6 text-center bg-[#0c0c0c]",
        finalCtaTitle: "text-3xl font-bold tracking-tight mb-8 text-white",
      };

    case "bold":
      return {
        wrapper: "bg-[#0a0014] text-white",
        hero: "min-h-[80vh] flex items-center justify-center py-24 bg-gradient-to-b from-violet-950/40 via-[#0a0014] to-[#0a0014]",
        headline:
          "text-5xl md:text-8xl font-black tracking-tight leading-[0.95] bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 bg-clip-text text-transparent",
        subHeadline:
          "text-lg md:text-2xl text-violet-200/70 mt-6 max-w-xl mx-auto font-light",
        ctaButton:
          "inline-block mt-10 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all cursor-pointer border-0",
        section: "py-24 px-6",
        sectionTitle:
          "text-4xl font-black tracking-tight text-center mb-14 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent",
        description:
          "text-lg text-violet-100/70 leading-relaxed text-center whitespace-pre-line",
        card: "p-8 bg-gradient-to-br from-violet-500/10 to-pink-500/5 border border-violet-500/20 rounded-2xl hover:border-violet-400/40 transition-all duration-300",
        cardIcon:
          "text-2xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20",
        cardTitle: "text-lg font-bold mb-2 text-violet-100",
        cardDesc: "text-sm text-violet-200/60 leading-relaxed",
        featureCard:
          "p-6 bg-violet-500/5 border border-violet-500/15 rounded-xl hover:bg-violet-500/10 transition-all duration-300",
        featureTitle: "text-base font-bold mb-1 text-violet-100",
        featureDesc: "text-sm text-violet-200/60 leading-relaxed",
        quoteWrapper:
          "max-w-3xl mx-auto text-center py-12 border-t border-b border-violet-500/20",
        quoteIcon:
          "text-6xl bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent font-serif",
        quote: "text-xl text-violet-100/80 italic mt-4 leading-relaxed",
        pricingWrapper: "max-w-6xl mx-auto",
        pricingIntro: "text-lg text-violet-200/60 mt-4 text-center max-w-2xl mx-auto",
        pricingCard: "p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 flex flex-col hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden",
        planName: "text-lg font-black tracking-tight text-white",
        planTarget: "text-xs text-violet-300/50 uppercase tracking-widest mt-1",
        planPrice: "text-5xl font-black bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent",
        planDesc: "text-sm text-violet-100/70 leading-relaxed",
        checkIcon: "text-pink-400 text-sm mt-0.5 font-bold",
        featureText: "text-sm text-violet-100/80",
        planButton: "mt-auto w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all border-0",
        finalCta:
          "py-28 px-6 text-center bg-gradient-to-t from-violet-950/30 to-transparent",
        finalCtaTitle:
          "text-4xl font-black tracking-tight mb-8 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent",
      };

    // editorial (default)
    default:
      return {
        wrapper: "bg-[#0a0a0a] text-neutral-100",
        hero: "min-h-[80vh] flex items-center justify-center py-24 bg-gradient-to-b from-[#0a0a0a] via-amber-950/10 to-[#0a0a0a]",
        headline:
          "text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] font-serif",
        subHeadline:
          "text-lg md:text-xl text-neutral-400 mt-6 max-w-xl mx-auto",
        ctaButton:
          "inline-block mt-10 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all cursor-pointer border-0",
        section: "py-20 px-6",
        sectionTitle:
          "text-3xl font-bold tracking-tight text-center mb-12 font-serif",
        description:
          "text-lg text-neutral-300 leading-relaxed text-center whitespace-pre-line",
        card: "p-8 bg-neutral-900/50 border border-amber-500/10 rounded-2xl hover:border-amber-500/25 transition-all duration-300",
        cardIcon:
          "text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500",
        cardTitle: "text-base font-semibold mb-2 text-amber-100",
        cardDesc: "text-sm text-neutral-400 leading-relaxed",
        featureCard:
          "p-6 bg-neutral-900/30 border border-neutral-800/50 rounded-xl hover:border-amber-500/20 transition-all duration-300",
        featureTitle: "text-base font-semibold mb-1 text-amber-100",
        featureDesc: "text-sm text-neutral-400 leading-relaxed",
        quoteWrapper:
          "max-w-3xl mx-auto text-center py-12 border-t border-b border-amber-500/10",
        quoteIcon: "text-5xl text-amber-500/40 font-serif",
        quote: "text-lg text-neutral-300 italic mt-4 leading-relaxed",
        pricingWrapper: "max-w-6xl mx-auto",
        pricingIntro: "text-lg text-neutral-400 mt-4 text-center max-w-2xl mx-auto font-serif",
        pricingCard: "p-8 rounded-2xl bg-neutral-900/50 border border-amber-500/10 flex flex-col hover:border-amber-500/30 transition-all duration-300",
        planName: "text-lg font-bold font-serif text-amber-100",
        planTarget: "text-xs text-neutral-500 mt-1",
        planPrice: "text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent",
        planDesc: "text-sm text-neutral-400 leading-relaxed",
        checkIcon: "text-amber-500 text-sm mt-0.5",
        featureText: "text-sm text-neutral-300",
        planButton: "mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all border-0",
        finalCta:
          "py-24 px-6 text-center bg-gradient-to-t from-amber-950/10 to-transparent",
        finalCtaTitle:
          "text-3xl font-bold tracking-tight mb-8 font-serif",
      };
  }
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function getIcon(index: number) {
  const icons = ["✦", "◈", "⬡", "◇", "△", "○"];
  return <span className="text-base">{icons[index % icons.length]}</span>;
}
