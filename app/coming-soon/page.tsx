export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#1F2F3A] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[#6A2E35] mb-6">London · St. Thomas · Strathroy</p>

      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
        Something Better<br />Is Coming.
      </h1>

      <p className="text-white/50 text-sm max-w-sm mb-10 leading-relaxed">
        Prospera Properties is putting the finishing touches on a new standard for property management in Southwestern Ontario.
      </p>

      <a
        href="mailto:hello@prosperaproperties.co"
        className="text-xs uppercase tracking-widest text-[#6A2E35] border border-[#6A2E35]/40 px-8 py-3 hover:bg-[#6A2E35]/10 transition-colors rounded"
      >
        Get in touch early
      </a>

      <p className="mt-16 text-white/20 text-xs">© {new Date().getFullYear()} Prospera Properties</p>
    </div>
  );
}
