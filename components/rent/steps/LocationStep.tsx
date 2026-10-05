"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { LONDON_AREAS } from "@/lib/rent/options";
import { NAVY, BORDER, WHITE, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

const ANYWHERE = "Anywhere in London";
const OTHER_CITY = "Other city / outside London";

export function LocationStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const areas = draft.preferred_areas ?? [];
  const otherSelected = areas.includes(OTHER_CITY);

  function toggle(area: string) {
    if (area === ANYWHERE) {
      update({ preferred_areas: areas.includes(ANYWHERE) ? [] : [ANYWHERE] });
      return;
    }
    const withoutAnywhere = areas.filter((a) => a !== ANYWHERE);
    const next = withoutAnywhere.includes(area) ? withoutAnywhere.filter((a) => a !== area) : [...withoutAnywhere, area];
    update({ preferred_areas: next, other_location: area === OTHER_CITY && !next.includes(OTHER_CITY) ? undefined : draft.other_location });
  }

  const canContinue = areas.length > 0 && (!otherSelected || !!draft.other_location?.trim());

  return (
    <StepShell
      section="Location"
      pct={pct}
      heading="Where in London would you like to live?"
      subheading="Pick as many areas as you'd consider."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!canContinue}
      wide
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {LONDON_AREAS.map((area) => (
          <Chip key={area} label={area} selected={areas.includes(area)} onClick={() => toggle(area)} />
        ))}
        <Chip label={ANYWHERE} selected={areas.includes(ANYWHERE)} onClick={() => toggle(ANYWHERE)} />
        <Chip label={OTHER_CITY} selected={otherSelected} onClick={() => toggle(OTHER_CITY)} />
      </div>

      {otherSelected && (
        <input
          autoFocus
          placeholder="Where are you looking? e.g. Strathroy, St. Thomas, Woodstock…"
          value={draft.other_location ?? ""}
          onChange={(e) => update({ other_location: e.target.value })}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 10,
            border: `1.5px solid ${BORDER}`,
            backgroundColor: WHITE,
            color: NAVY,
            fontFamily: BODY_FONT,
            fontSize: 15,
          }}
        />
      )}
    </StepShell>
  );
}
