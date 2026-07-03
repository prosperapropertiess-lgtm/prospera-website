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
  const moveInTotal = calcMoveIn(property);
  const estimatedMonthly = calcEstimatedMonthly(property);
  const includedUtils = property.utilities_list ?? [];
  const tenantUtils = (property.utilities_tenant_paid ?? []) as UtilityTenantPaid[];

  const allUtilities = [
    ...includedUtils.map((u) => ({ name: u, included: true, avg_cost: undefined })),
    ...tenantUtils.map((u) => ({ name: u.name, included: false, avg_cost: u.avg_cost })),
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Financial Clarity
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Cost Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {/* Monthly rent */}
          <div>
            <div
              className="rounded-xl p-8"
              style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                Monthly Rent
              </p>
              <p
                className="text-4xl font-bold"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                ${property.price.toLocaleString()}
              </p>
              <p className="text-sm mt-1" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                per month
              </p>
            </div>
          </div>

          {/* Move-in costs */}
          <div>
            <div
              className="rounded-xl p-8"
              style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                Move-In Total
              </p>
              <p
                className="text-4xl font-bold"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                ${moveInTotal.toLocaleString()}
              </p>
              <p className="text-sm mt-1" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                First month + ${deposit?.toLocaleString()} deposit
              </p>
            </div>
          </div>
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
          </div>
        )}

        {/* Estimated monthly */}
        {tenantUtils.some((u) => u.avg_cost) && (
          <div>
            <div
              className="mt-5 rounded-xl p-6 flex items-center justify-between"
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
