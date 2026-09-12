"use client";
import Script from "next/script";

/**
 * Beehiiv's real "Web Embed" widget for the Almost Passive newsletter —
 * replaces the hand-built form-to-hidden-iframe in AlmostPassiveSignup.
 * The script mounts a subscribe widget at its own position in the DOM once
 * it loads in the browser. Given from Ebin directly (Beehiiv dashboard ->
 * Grow -> Subscribe Forms -> Web Embed).
 */
const FORM_ID = "82f10e1a-e211-4b67-9818-4a5914be9d14";

export default function BeehiivEmbed() {
  return (
    <div data-beehiiv-embed-wrapper="true">
      <Script
        src="https://subscribe-forms.beehiiv.com/v3/loader.js"
        data-beehiiv-form={FORM_ID}
        strategy="lazyOnload"
      />
      <Script
        src="https://subscribe-forms.beehiiv.com/attribution.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
