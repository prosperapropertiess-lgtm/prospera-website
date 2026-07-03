"use client";

import { PawPrint, Cigarette, Clock, Users, UserCheck, CalendarDays } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface PolicyRow {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function buildPolicies(property: PropertyRecord): PolicyRow[] {
  const rows: PolicyRow[] = [];

  if (property.pet_friendly !== undefined || property.pet_policy) {
    let petValue = property.pet_friendly ? "Pets allowed" : "No pets";
    if (property.pet_policy && typeof property.pet_policy === "object") {
      const pp = property.pet_policy as Record<string, unknown>;
      const parts: string[] = [];
      if (pp.cats) parts.push("Cats allowed");
      if (pp.dogs) parts.push("Dogs allowed");
      if (pp.other && typeof pp.other === "string") parts.push(pp.other);
      if (pp.deposit) parts.push(`Pet deposit: $${pp.deposit}`);
      if (pp.restrictions && typeof pp.restrictions === "string") parts.push(pp.restrictions);
      if (parts.length) petValue = parts.join(". ");
    } else if (typeof property.pet_policy === "string") {
      petValue = property.pet_policy;
    }
    rows.push({
      icon: <PawPrint size={16} />,
      label: "Pet Policy",
      value: petValue,
    });
  }

  const smokingAllowed = property.smoking_allowed;
  if (smokingAllowed !== undefined && smokingAllowed !== null) {
    rows.push({
      icon: <Cigarette size={16} />,
      label: "Smoking",
      value: smokingAllowed === false ? "No smoking" : "Smoking permitted",
    });
  }

  const quietHours = (property as Record<string, unknown>).quiet_hours as string | undefined;
  if (quietHours) {
    rows.push({
      icon: <Clock size={16} />,
      label: "Quiet Hours",
      value: quietHours,
    });
  }

  const maxOccupants = (property as Record<string, unknown>).max_occupants as number | undefined;
  if (maxOccupants) {
    rows.push({
      icon: <Users size={16} />,
      label: "Max Occupants",
      value: `${maxOccupants} person${maxOccupants === 1 ? "" : "s"}`,
    });
  }

  const guestPolicy = (property as Record<string, unknown>).guest_policy as string | undefined;
  if (guestPolicy) {
    rows.push({
      icon: <UserCheck size={16} />,
      label: "Guest Policy",
      value: guestPolicy,
    });
  }

  const leaseTerm = (property as Record<string, unknown>).lease_term as string | undefined;
  if (leaseTerm) {
    rows.push({
      icon: <CalendarDays size={16} />,
      label: "Lease Term",
      value: leaseTerm,
    });
  }

  return rows;
}

export default function PoliciesSection({ property }: Props) {
  const policies = buildPolicies(property);
  if (!policies.length) return null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            House Rules
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Policies
          </h2>
        </div>

        <div>
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="divide-y" style={{ borderColor: "#D8D2C8" }}>
              {policies.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-5 px-7 py-5"
                >
                  <span style={{ color: "#1F2F3A", flexShrink: 0 }}>{row.icon}</span>
                  <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between gap-4">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1 sm:mb-0"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {row.label}
                    </p>
                    <p
                      className="text-sm sm:text-right"
                      style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
