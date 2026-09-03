import Link from "next/link";
import type { Metadata } from "next";
import FadeIn from "@/components/animations/FadeIn";
import SupportForm from "@/components/support/SupportForm";

export const metadata: Metadata = {
  title: "Prospera App Support | Prospera Properties",
  description:
    "Need help with the Prospera landlord app? Get support for your account, properties, maintenance, documents, and app issues from Prospera Properties.",
};

const CATEGORIES = [
  {
    icon: "🔑",
    title: "Account & Login",
    items: ["Signing in", "Accessing your account", "Account information", "Trouble opening the app", "Problems seeing your properties"],
    cta: "Get Account Help",
    href: "#contact",
  },
  {
    icon: "🏠",
    title: "Properties & Portfolio",
    items: ["Property information", "Units", "Lease information", "Portfolio details", "Information that looks incorrect"],
    cta: "Contact Prospera",
    href: "#contact",
  },
  {
    icon: "🔧",
    title: "Maintenance",
    items: ["Viewing a maintenance request", "Understanding the current status", "Owner approvals", "Contractor updates", "Repair documents and costs"],
    cta: "Ask About a Repair",
    href: "#contact",
  },
  {
    icon: "📄",
    title: "Documents",
    items: ["Leases", "Receipts", "Invoices", "Repair documents", "Permits and other property records"],
    cta: "Get Help With Documents",
    href: "#contact",
  },
  {
    icon: "📱",
    title: "App Problems",
    items: ["Pages not loading", "Buttons not working", "Missing information", "Upload problems", "Unexpected errors"],
    cta: "Report a Problem",
    href: "#contact",
  },
];

const FAQS = [
  {
    q: "Who can use the Prospera app?",
    a: "The app is for property owners whose properties are managed by Prospera Properties.",
  },
  {
    q: "I cannot see one of my properties. What should I do?",
    a: "Contact Prospera and tell us which property is missing.",
  },
  {
    q: "How do I report a maintenance problem?",
    a: "Use the normal maintenance process Prospera already gave you, including the 24/7 emergency line for anything urgent. If you're an owner asking about an existing repair, you can also reach us through this page.",
  },
  {
    q: "Why does the app say “Action Required”?",
    a: "This means Prospera needs something from you before we can move forward. This may be an approval, a document, a signature, or a decision.",
  },
  {
    q: "Where can I find invoices and receipts?",
    a: "Documents connected to your properties and maintenance work can be found in the Documents area of the app when available.",
  },
  {
    q: "How do I report a problem with the app?",
    a: "Send us a message explaining what you were trying to do and what happened. Include a screenshot if you can.",
  },
  {
    q: "Is Prospera only an app?",
    a: "No. Prospera is a local property management company. The app is part of the service we already provide to property owners.",
  },
];

export default function SupportPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-5 sm:px-8 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Prospera App Support
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Need help with the Prospera app?
          </h1>
          <p className="text-base max-w-lg mx-auto leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
            Prospera is the owner app for Prospera Properties. If you need help with your account, a property,
            maintenance, documents, or something in the app, contact us and we&apos;ll help.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="inline-block px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Contact Prospera
            </a>
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-widest border-b pb-px transition-opacity hover:opacity-60"
              style={{ color: "rgba(250,248,245,0.6)", borderColor: "rgba(250,248,245,0.25)", fontFamily: "var(--font-dm-sans)" }}
            >
              Visit Prospera Properties →
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* What can we help with */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Where to Start
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              What can we help with?
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 0.06}>
                <div
                  className="bg-white border rounded-2xl p-7 h-full flex flex-col"
                  style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  <div className="text-3xl mb-4">{cat.icon}</div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                    {cat.title}
                  </h3>
                  <ul className="mb-6 flex-1">
                    {cat.items.map((item) => (
                      <li key={item} className="text-sm leading-relaxed mb-1.5 flex items-start gap-2" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: "#D8D2C8" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={cat.href}
                    className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {cat.cta} →
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Can't sign in */}
      <section className="py-16 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-light mb-5" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Can&apos;t sign in?
            </h2>
            <p className="text-base leading-relaxed mb-2" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              If you cannot sign in to your Prospera account, contact us using the form below. Tell us the email
              address connected to your Prospera account.
            </p>
            <p className="text-sm font-semibold" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
              For your security, never send us your password.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Talk to a Real Person
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Contact Prospera
            </h2>
            <p className="text-base text-center max-w-lg mx-auto mb-14 leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              The Prospera app is backed by the same local team that manages your property. If something isn&apos;t
              working or you have a question, contact us.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
            {/* Left: direct contact info */}
            <FadeIn>
              <div className="space-y-10 pt-2">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Phone</p>
                  <a
                    href="tel:5196971227"
                    className="text-2xl font-light transition-opacity hover:opacity-70"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                  >
                    (519) 697-1227
                  </a>
                  <p className="text-xs mt-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Available 24/7 for maintenance emergencies</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Email</p>
                  <a
                    href="mailto:hello@prosperaproperties.co"
                    className="text-sm transition-opacity hover:opacity-70 break-all"
                    style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                  >
                    hello@prosperaproperties.co
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Service Areas</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    London, Ontario<br />
                    St. Thomas, Ontario<br />
                    Strathroy, Ontario
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Right: short support form */}
            <FadeIn delay={0.1} className="md:col-span-2">
              <SupportForm />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Quick Answers
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              A few common questions.
            </h2>
          </FadeIn>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <FadeIn key={item.q} delay={i * 0.04}>
                <details
                  className="group border rounded-xl px-5 py-4"
                  style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}
                >
                  <summary
                    className="text-base font-semibold cursor-pointer list-none flex items-center justify-between gap-4"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {item.q}
                    <span className="text-lg shrink-0 transition-transform group-open:rotate-45" style={{ color: "#8B2030" }}>+</span>
                  </summary>
                  <p className="text-sm leading-relaxed mt-3" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    {item.a}
                  </p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About the app */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              About the Prospera App
            </p>
            <p className="text-lg sm:text-xl leading-relaxed mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 300 }}>
              Prospera is the landlord app for Prospera Properties, a local property management company serving
              London, Ontario and nearby communities.
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
              The app helps Prospera clients see their properties, maintenance, documents, and anything that needs
              their attention. It doesn&apos;t replace the property management service &mdash; it gives owners a
              clearer view of the work Prospera is already doing for their portfolio.
            </p>
            <Link
              href="/"
              className="inline-block text-xs font-semibold uppercase tracking-widest border-b pb-0.5 transition-opacity hover:opacity-70"
              style={{ color: "rgba(250,248,245,0.85)", borderColor: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}
            >
              Learn more about Prospera Properties →
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
