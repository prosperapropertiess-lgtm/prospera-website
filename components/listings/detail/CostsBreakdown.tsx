"use client";

import { Check, X } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface UtilityTenantPaid {
  name: string;
  avg_cost?: number;
}

function calcMoveIn(property: PropertyRecord): number {
  const deposit = property.deposit ?? property.price ?? 0;
  return property.price + deposit;
}

function calcEstimatedMonthly(property: PropertyRecord): number {
  const tenantUtils = (property.utilities_tenant_paid ?? []) as UtilityTenantPaid[];
  const utilsCost = tenantUtils.reduce((sum, u) => sum + (u.avg_cost ?? 0), 0);
  return property.price + utilsCost;
}

export default function CostsBreakdown({ property }: Props) {
  const deposit = property.deposit ?? property.price;
  const estimatedMonthly = calcEstimatedMonthly(property);
  const includedUtils = property.utilities_list ?? [];
  const tenantUtils = (property.utilities_tenant_paid ?? []) as UtilityTenantPaid[];

  const allUtilities = [
    ...includedUtils.map((u) => ({ name: u, included: true, avg_cost: undefined })),
    ...tenantUtils.map((u) => ({ name: u.name, included: false, avg_cost: u.avg_cost })),
  ];

  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Financial Clarity
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-8 md:mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            What You Pay
          </h2>
        </div>

        {/* Rent hero */}
        <div
          className="rounded-2xl p-8 sm:p-10 mb-4"
          style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Monthly Rent
          </p>
          <p
            className="text-5xl sm:text-6xl font-bold leading-none mb-2"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            ${property.price.toLocaleString()}
          </p>
          <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            per month, fixed for the term of your lease
          </p>

          {/* Deposit note — framed as refundable, not a cost */}
          {deposit && (
            <div
              className="mt-6 flex items-start gap-3 px-5 py-4 rounded-xl"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                <circle cx="8" cy="8" r="7" stroke="#2D7A4F" strokeWidth="1.5" />
                <path d="M5 8l2 2 4-4" stroke="#2D7A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  Security deposit: ${deposit.toLocaleString()}, fully refundable
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Returned in full at move-out when the unit is left in good condition. This is your money held in trust, not a fee.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Utilities table */}
        {allUtilities.length > 0 && (
          <div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #D8D2C8" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Utilities
                </p>
              </div>
              <div className="bg-white divide-y" style={{ borderColor: "#D8D2C8" }}>
                {allUtilities.map((util, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      {util.included ? (
                        <Check size={15} color="#2D7A4F" strokeWidth={2.5} />
                      ) : (
                        <X size={15} color="#666666" strokeWidth={2.5} />
                      )}
                      <span
                        className="text-sm"
                        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {util.name}
                      </span>
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        color: util.included ? "#2D7A4F" : "#666666",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {util.included
                        ? "Included"
                        : util.avg_cost
                        ? `~$${util.avg_cost}/mo`
                        : "Tenant pays"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Utilities disclaimer — only when utilities are NOT fully included */}
            {!property.utilities_included && (
              <p
                className="text-xs mt-3"
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                Utilities are extra and vary by usage.
              </p>
            )}
          </div>
        )}

        {/* Estimated monthly */}
        {tenantUtils.some((u) => u.avg_cost) && (
          <div>
            <div
              className="mt-5 rounded-xl p-6 flex flex-wrap items-center justify-between gap-3"
              style={{ backgroundColor: "#1F2F3A" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Estimated Total Monthly Cost
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
              >
                ~${estimatedMonthly.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
