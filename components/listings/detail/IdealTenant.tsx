
import type { PropertyRecord } from "./ListingPage";

const PROFILES: Record<string, { label: string; icon: string; desc: string }> = {
  young_professional: { label: "Young Professionals", icon: "💼", desc: "Close to downtown, modern amenities, easy commute" },
  couple: { label: "Couples", icon: "💑", desc: "Cozy space, quiet neighbourhood, room to grow" },
  small_family: { label: "Small Families", icon: "👨‍👩‍👧", desc: "Safe area, nearby schools, outdoor space" },
  student: { label: "Students", icon: "🎓", desc: "Near campus, affordable, transit-friendly" },
  retiree: { label: "Retirees", icon: "🏡", desc: "Peaceful setting, accessible, close to amenities" },
  roommates: { label: "Roommates", icon: "🤝", desc: "Multiple bedrooms, shared living, good layout" },
  remote_worker: { label: "Remote Workers", icon: "💻", desc: "Quiet workspace, reliable internet, comfortable setup" },
  pet_owner: { label: "Pet Owners", icon: "🐾", desc: "Pet-friendly, nearby parks, outdoor access" },
  newcomer: { label: "New to Canada", icon: "🌍", desc: "Welcome community, transit access, essential amenities nearby" },
};

interface Props {
  property: PropertyRecord;
}

export default function IdealTenant({ property }: Props) {
  const profiles = (property.ideal_tenant_profile as string[] | undefined) || [];
  if (profiles.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#666666" }}>
            Perfect For
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            This home is ideal for
          </h2>
        </div>

        {/* Mobile: inline pill list */}
        <div className="md:hidden flex flex-wrap gap-3 justify-center">
          {profiles.map((key) => {
            const profile = PROFILES[key];
            if (!profile) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}
              >
                <span className="text-lg">{profile.icon}</span>
                <span className="text-sm font-semibold" style={{ color: "#1F2F3A" }}>{profile.label}</span>
              </div>
            );
          })}
        </div>

        {/* Desktop: card grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((key) => {
            const profile = PROFILES[key];
            if (!profile) return null;
            return (
              <div key={key}>
                <div
                  className="bg-white rounded-xl p-6 border transition-all hover:shadow-md"
                  style={{ borderColor: "#D8D2C8" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{profile.icon}</span>
                    <h3 className="text-base font-semibold" style={{ color: "#1F2F3A" }}>{profile.label}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333" }}>{profile.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
