import Link from "next/link";
import type { Metadata } from "next";
import FadeIn from "@/components/animations/FadeIn";

export const metadata: Metadata = {
  title: "Privacy Policy | Prospera Properties",
  description: "How Prospera Properties collects, uses, and protects your information across the Prospera website and app.",
};

const EFFECTIVE_DATE = "September 3, 2026";

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      <section className="pt-32 pb-16 px-5 sm:px-8 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Effective {EFFECTIVE_DATE}
          </p>
        </FadeIn>
      </section>

      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="prose-content" style={{ fontFamily: "var(--font-dm-sans)" }}>
              <p>
                Prospera Properties (&quot;Prospera,&quot; &quot;we,&quot; &quot;us&quot;) provides property management
                services and a companion app, Rentified, that gives landlords and residents a clear view of their
                properties, rent, maintenance, and documents. This policy explains what information we collect
                through <strong>prosperaproperties.co</strong> and the Rentified app, why we collect it, and what
                choices you have.
              </p>
              <p>
                If anything here is unclear, contact us at{" "}
                <a href="mailto:hello@prosperaproperties.co">hello@prosperaproperties.co</a> or{" "}
                <a href="tel:5196971227">(519) 697-1227</a>. You can also reach us through our{" "}
                <Link href="/support">support page</Link>.
              </p>

              <h2>Information We Collect</h2>

              <h3>Account &amp; Contact Information</h3>
              <p>
                When you create an account, sign in, or contact us, we collect your name, email address, phone
                number, and (for app sign-in) a 4-digit PIN. We never see or store your PIN as readable text — it
                is stored the same way a password is, in a form that cannot be reversed.
              </p>

              <h3>Property &amp; Lease Information</h3>
              <p>
                For landlords, we collect information about your properties and units — addresses, unit details,
                and rent amounts. For residents, we collect your lease details, including your unit, rent, and
                lease dates, so both you and your landlord have an accurate record.
              </p>

              <h3>Payment Information</h3>
              <p>
                Rent payments made through the app are processed by Stripe, a payment processor used by millions
                of businesses. Prospera does not receive or store your full card or bank account number — Stripe
                handles that directly and securely. We keep a record of payment amounts, dates, and status so
                landlords and residents can see an accurate rent history.
              </p>

              <h3>Maintenance Information</h3>
              <p>
                When a maintenance request is submitted, we collect the description of the issue, its priority,
                its status, and any photos provided to help explain the problem.
              </p>

              <h3>Messages &amp; Communications</h3>
              <p>
                If you message us through the app, our website&apos;s contact form, or our support page, we keep a
                record of that conversation so we can respond and follow up.
              </p>

              <h3>Device &amp; Usage Information</h3>
              <p>
                Like most apps and websites, we automatically collect some basic technical information — such as
                device type, app version, and general usage patterns — to help us fix bugs and improve the app. If
                you enable push notifications, we store a notification token so we can send you updates (like a
                new maintenance update or a rent reminder).
              </p>

              <h2>How We Use Your Information</h2>
              <ul>
                <li>To run your account and show you the right properties, leases, and records</li>
                <li>To process rent payments and keep an accurate payment history</li>
                <li>To coordinate maintenance requests with contractors on your behalf</li>
                <li>To respond when you contact us for help</li>
                <li>To send you updates you&apos;ve asked for, like rent reminders or maintenance status changes</li>
                <li>To keep the app and website secure and working properly</li>
              </ul>
              <p>We do not use your information to show you ads, and we do not sell your information to anyone.</p>

              <h2>Who We Share Information With</h2>
              <p>
                We share information only with the service providers that help us run Prospera and the app, and
                only as much as each one needs to do its job:
              </p>
              <ul>
                <li><strong>Supabase</strong> — securely hosts our app database and handles sign-in</li>
                <li><strong>Stripe</strong> — processes rent payments</li>
                <li><strong>Notion</strong> — our internal system of record for properties, owners, and tenants</li>
                <li><strong>HubSpot</strong> — helps us keep track of inquiries from prospective clients</li>
                <li><strong>Resend</strong> — delivers transactional emails (like confirmations and receipts)</li>
                <li><strong>Google</strong> — address lookup (Google Maps) and website analytics (Google Analytics)</li>
                <li><strong>Vercel</strong> — hosts our website</li>
              </ul>
              <p>
                We may also share information if required by law, or to protect the rights, safety, or property of
                Prospera, our clients, or others.
              </p>

              <h2>Data Retention</h2>
              <p>
                We keep your information for as long as your account is active, and for a reasonable period after
                — for example, to maintain accurate financial and lease records as required for property
                management and tax purposes. If you delete your account, we remove your account data; some records
                (like completed payment history) may be retained longer where we have a legitimate business or
                legal reason to do so.
              </p>

              <h2>Your Choices</h2>
              <p>
                You can review and update your account information from the Profile section of the app at any
                time. If you want your account deleted, you can do this yourself directly in the app: open{" "}
                <strong>Profile → Delete Account</strong>. This permanently removes your account and the
                information tied to it. You can also contact us at{" "}
                <a href="mailto:hello@prosperaproperties.co">hello@prosperaproperties.co</a> to ask what information
                we have about you, correct it, or request it be deleted.
              </p>

              <h2>Children&apos;s Privacy</h2>
              <p>
                The Rentified app and Prospera&apos;s services are intended for adults entering into or managing a
                real property lease. We do not knowingly collect information from children under 13.
              </p>

              <h2>Security</h2>
              <p>
                We use industry-standard measures — including encrypted connections and access controls — to
                protect your information. No system is 100% secure, but we take reasonable steps to keep your data
                safe and to limit access to only what each of our systems needs.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                If we make meaningful changes to this policy, we&apos;ll update the effective date at the top of
                this page. We encourage you to check back occasionally.
              </p>

              <h2>Contact Us</h2>
              <p>
                Prospera Properties<br />
                London, St. Thomas &amp; Strathroy, Ontario<br />
                Email: <a href="mailto:hello@prosperaproperties.co">hello@prosperaproperties.co</a><br />
                Phone: <a href="tel:5196971227">(519) 697-1227</a>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
