// Haptic feedback for web pages.
// Android: the Vibration API. iPhone: Safari has no Vibration API, but since iOS 18
// toggling a <input type="checkbox" switch> gives a system haptic tick, so we flip a
// hidden one. Apple doesn't document that, so it may stop working; it fails silently.
// Must be called synchronously inside the tap handler, or iOS ignores it.

let iosSwitch: HTMLLabelElement | null = null;

function iosTick() {
  if (typeof document === "undefined") return;
  if (!iosSwitch) {
    iosSwitch = document.createElement("label");
    iosSwitch.ariaHidden = "true";
    iosSwitch.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    iosSwitch.appendChild(input);
    document.body.appendChild(iosSwitch);
  }
  iosSwitch.click();
}

/** "tap" for a normal press, "success" for a milestone like hitting the day's target. */
export function haptic(kind: "tap" | "success" = "tap") {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(kind === "success" ? [18, 60, 18, 60, 30] : 12);
    } else {
      iosTick();
    }
  } catch {}
}
