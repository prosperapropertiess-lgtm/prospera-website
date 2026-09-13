"use client";
import { useEffect, useRef } from "react";

/**
 * Beehiiv's real "Web Embed" widget for the Almost Passive newsletter —
 * replaces the hand-built form-to-hidden-iframe in AlmostPassiveSignup.
 * Given from Ebin directly (Beehiiv dashboard -> Grow -> Subscribe Forms ->
 * Web Embed).
 *
 * Beehiiv's loader.js (read the actual source to confirm this — don't guess)
 * finds every `<script data-beehiiv-form>` tag on the page and inserts the
 * widget as THAT SCRIPT TAG'S NEXT SIBLING (`this.script.parentNode.
 * insertBefore(wrap, this.script.nextSibling)`). Its on-page position is
 * 100% tied to where the literal <script> element lives in the DOM.
 *
 * That's why next/script's `strategy="lazyOnload"` broke this: Next injects
 * non-blocking scripts out-of-band, not at their JSX position, so the tag
 * never actually lived inside our wrapper div — the widget was rendering
 * itself somewhere else on the page entirely, while this CTA box stayed
 * permanently empty. Injecting the <script> manually into a ref'd div gives
 * us the DOM position guarantee the widget actually depends on.
 */
const FORM_ID = "82f10e1a-e211-4b67-9818-4a5914be9d14";
const LOADER_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";
const ATTRIBUTION_SRC = "https://subscribe-forms.beehiiv.com/attribution.js";

export default function BeehiivEmbed({ instanceId = "default" }: { instanceId?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const loader = document.createElement("script");
    loader.src = LOADER_SRC;
    loader.async = true;
    loader.setAttribute("data-beehiiv-form", FORM_ID);
    wrapper.appendChild(loader);

    const attribution = document.createElement("script");
    attribution.src = ATTRIBUTION_SRC;
    attribution.async = true;
    wrapper.appendChild(attribution);

    return () => {
      loader.remove();
      attribution.remove();
    };
  }, [instanceId]);

  return <div ref={wrapperRef} data-beehiiv-embed-wrapper="true" />;
}
