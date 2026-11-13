"use client";
// "Add to Home Screen" guide. Steps are written per device. Screenshots must be
// real captures of each browser's flow: until they're added to /public/install/,
// each slot shows a clearly labeled "screenshot needed" box, never a mock-up.
import { useEffect, useState } from "react";

const NAVY = "#1F2F3A", BORDER = "#D8D2C8", MUTED = "#666666", BURGUNDY = "#8B2030";

type Device = "ios" | "android" | "desktop";
interface Step { text: string; shot: string | null; need: string }

// Set `shot` to a file in /public/install once a real screenshot is captured.
const GUIDES: Record<Device, { label: string; steps: Step[] }> = {
  ios: {
    label: "iPhone or iPad (Safari)",
    steps: [
      { text: "Open your dashboard link in Safari. (If it opened inside Gmail or another app, tap the compass or “Open in Safari” first.)", shot: null, need: "iPhone, Safari: dashboard open, address bar visible" },
      { text: "Tap the Share button: the square with an arrow pointing up, at the bottom of the screen.", shot: null, need: "iPhone, Safari: Share button highlighted" },
      { text: "Scroll down and tap “Add to Home Screen”.", shot: null, need: "iPhone share sheet with “Add to Home Screen” row" },
      { text: "Tap “Add” in the top right. “My Property” now sits on your home screen.", shot: null, need: "iPhone “Add to Home Screen” confirm screen" },
    ],
  },
  android: {
    label: "Android (Chrome)",
    steps: [
      { text: "Open your dashboard link in Chrome.", shot: null, need: "Android, Chrome: dashboard open" },
      { text: "Tap the ⋮ menu in the top right.", shot: null, need: "Android Chrome menu open" },
      { text: "Tap “Add to Home screen” or “Install app”.", shot: null, need: "Android Chrome menu with “Install app” / “Add to Home screen”" },
      { text: "Tap “Install” or “Add”. The app appears on your home screen.", shot: null, need: "Android install confirmation dialog" },
    ],
  },
  desktop: {
    label: "Computer (Chrome or Edge)",
    steps: [
      { text: "Open your dashboard link in Chrome or Edge.", shot: null, need: "Desktop Chrome: dashboard open" },
      { text: "Click the install icon at the right end of the address bar (a screen with a down arrow), or open the ⋮ menu and choose “Install My Property”.", shot: null, need: "Desktop Chrome address bar install icon" },
      { text: "Click “Install”. It opens in its own window and you can pin it to your taskbar or dock.", shot: null, need: "Desktop Chrome install dialog" },
    ],
  },
};

function detect(): Device {
  if (typeof navigator === "undefined") return "ios";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallGuide() {
  const [device, setDevice] = useState<Device>("ios");
  const [installEvt, setInstallEvt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDevice(detect());
      setInstalled(window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
    }, 0);
    const onPrompt = (e: Event) => { e.preventDefault(); setInstallEvt(e as PromptEvent); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", onPrompt); };
  }, []);

  if (installed) return <p className="text-[15px]" style={{ color: NAVY }}>You&apos;re using the installed app. Nothing else to do.</p>;

  const g = GUIDES[device];
  return (
    <div className="grid gap-4">
      {installEvt && (
        <button type="button" onClick={async () => { await installEvt.prompt(); setInstallEvt(null); }}
          className="w-full rounded-xl py-4 font-semibold text-[15px]" style={{ background: BURGUNDY, color: "#FAF8F5" }}>
          Install the app now
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GUIDES) as Device[]).map((d) => (
          <button key={d} type="button" onClick={() => setDevice(d)} className="rounded-full border-2 px-3.5 py-2 text-sm font-semibold"
            style={{ borderColor: d === device ? NAVY : BORDER, background: d === device ? NAVY : "#fff", color: d === device ? "#FAF8F5" : NAVY }}>
            {GUIDES[d].label}
          </button>
        ))}
      </div>
      <ol className="grid gap-4">
        {g.steps.map((s, i) => (
          <li key={i} className="grid gap-2">
            <div className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: NAVY, color: "#FAF8F5" }}>{i + 1}</span>
              <p className="text-[15px] leading-relaxed" style={{ color: "#222" }}>{s.text}</p>
            </div>
            {s.shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.shot} alt={s.need} className="w-full max-w-xs rounded-xl border ml-10" style={{ borderColor: BORDER }} />
            ) : (
              <div className="ml-10 max-w-xs rounded-xl border-2 border-dashed px-3 py-4 text-xs" style={{ borderColor: BORDER, color: MUTED }}>
                <b>Screenshot needed</b> (asset not added yet): {s.need}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
