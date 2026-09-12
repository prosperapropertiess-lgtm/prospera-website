"use client";
import Script from "next/script";

/**
 * Beehiiv's real "Web Embed" widget for the Almost Passive newsletter —
 * replaces the hand-built form-to-hidden-iframe in AlmostPassiveSignup.
 * The script mounts a subscribe widget at its own position in the DOM once
 * it loads in the browser. Given from Ebin directly (Beehiiv dashboard ->
 * Grow -> Subscribe Forms -> Web Embed).
 *
 * `instanceId` MUST be unique per <BeehiivEmbed> rendered on the same page.
 * next/script dedupes by src and only ever injects one real <script> tag
 * for a given src — without a distinct `id` per instance, a post with
 * 3 CTA placements (top/mid/end) only got ONE working form; the other two
 * showed the CTA copy with an empty box. The `id` forces Next to treat
 * each placement as a separate script load.
 */
const FORM_ID = "82f10e1a-e211-4b67-9818-4a5914be9d14";

export default function BeehiivEmbed({ instanceId = "default" }: { instanceId?: string }) {
  return (
    <div data-beehiiv-embed-wrapper="true">
      <Script
        id={`beehiiv-loader-${instanceId}`}
        src="https://subscribe-forms.beehiiv.com/v3/loader.js"
        data-beehiiv-form={FORM_ID}
        strategy="lazyOnload"
      />
      <Script
        id={`beehiiv-attribution-${instanceId}`}
        src="https://subscribe-forms.beehiiv.com/attribution.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
