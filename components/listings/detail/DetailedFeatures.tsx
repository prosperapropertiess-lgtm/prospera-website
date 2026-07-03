"use client";

import { Thermometer, Car, Building2, Trees, Utensils, Check } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface FeatureSection {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

function buildSections(property: PropertyRecord): FeatureSection[] {
  const sections: FeatureSection[] = [];
  const raw = property as Record<string, unknown>;

  const kitchenItems: string[] = [];
  if (raw.dishwasher) kitchenItems.push("Dishwasher");
  if (raw.fridge) kitchenItems.push("Refrigerator");
  if (raw.stove) kitchenItems.push("Stove / Oven");
  if (raw.microwave) kitchenItems.push("Microwave");
  if (raw.in_unit_laundry) kitchenItems.push("In-Unit Laundry");
  if (raw.laundry_shared) kitchenItems.push("Shared Laundry");
  if (raw.washer_dryer) kitchenItems.push("Washer & Dryer");
  if (kitchenItems.length) {
    sections.push({ title: "Kitchen & Appliances", icon: <Utensils size={16} />, items: kitchenItems });
  }

  const climateItems: string[] = [];
  if (raw.ac || raw.air_conditioning) climateItems.push("Air Conditioning");
  if (raw.heating) climateItems.push(typeof raw.heating === "string" ? `Heating: ${raw.heating}` : "Heating");
  if (raw.heat_included) climateItems.push("Heat Included");
  if (raw.hydro_included || raw.electricity_included) climateItems.push("Hydro Included");
  if (climateItems.length) {
    sections.push({ title: "Climate & Utilities", icon: <Thermometer size={16} />, items: climateItems });
  }

  const buildingItems: string[] = [];
  if (property.parking) buildingItems.push("Parking Included");
  if (raw.garage) buildingItems.push("Garage");
  if (raw.storage) buildingItems.push("Storage Unit");
  if (raw.elevator) buildingItems.push("Elevator");
  if (raw.wheelchair_accessible) buildingItems.push("Wheelchair Accessible");
  if (raw.intercom) buildingItems.push("Intercom / Buzzer");
  if (raw.security_cameras) buildingItems.push("Security Cameras");
  if (raw.locker) buildingItems.push("Locker");
  if (buildingItems.length) {
    sections.push({ title: "Building", icon: <Building2 size={16} />, items: buildingItems });
  }

  const outdoorItems: string[] = [];
  if (raw.balcony) outdoorItems.push("Balcony");
  if (raw.patio) outdoorItems.push("Patio");
  if (raw.backyard) outdoorItems.push("Backyard");
  if (raw.deck) outdoorItems.push("Deck");
  if (raw.gym) outdoorItems.push("Gym / Fitness Room");
  if (raw.pool) outdoorItems.push("Pool");
  if (raw.rooftop) outdoorItems.push("Rooftop Access");
  if (outdoorItems.length) {
    sections.push({ title: "Outdoor & Extras", icon: <Trees size={16} />, items: outdoorItems });
  }

  // Parking section standalone if no building items but parking or garage exist
  const carItems: string[] = [];
  if (raw.ev_charging) carItems.push("EV Charging");
  if (raw.garage_door_opener) carItems.push("Garage Door Opener");
  if (carItems.length) {
    sections.push({ title: "Parking & Vehicles", icon: <Car size={16} />, items: carItems });
  }

  return sections;
}

export default function DetailedFeatures({ property }: Props) {
  const sections = buildSections(property);
  if (!sections.length) return null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Features & Amenities
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Everything Included
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sections.map((section, i) => (
            <div key={section.title}>
              <div
                className="rounded-xl p-7 h-full"
                style={{
                  backgroundColor: "#F7F5F2",
                  border: "1px solid #D8D2C8",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span style={{ color: "#1F2F3A" }}>{section.icon}</span>
                  <h3
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check size={14} color="#1F2F3A" strokeWidth={2.5} className="flex-shrink-0" />
                      <span
                        className="text-sm"
                        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
