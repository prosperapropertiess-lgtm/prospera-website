const FONT = "var(--font-dm-sans)";
const SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const BORDER = "#E8E4DF";

export interface CaseStudy {
  propertyType: string;
  headline: string;
  problem: string;
  whatWeDid: string;
  result: string;
  href?: string;
  placeholder?: boolean;
}

export default function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: 28, position: "relative", opacity: study.placeholder ? 0.55 : 1,
      }}
    >
      {study.placeholder && (
        <span style={{
          position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em", color: "#999",
          border: "1px dashed #ccc", borderRadius: 6, padding: "3px 8px", fontFamily: FONT,
        }}>
          Placeholder
        </span>
      )}
      <p style={{ fontSize: 11, fontWeight: 700, color: CRIMSON, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: FONT }}>
        {study.propertyType}
      </p>
      <h3 style={{ fontSize: 22, fontWeight: 400, color: NAVY, fontFamily: SERIF, marginBottom: 16, lineHeight: 1.3 }}>
        {study.headline}
      </h3>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>The Problem</p>
        <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, fontFamily: FONT }}>{study.problem}</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>What Prospera Did</p>
        <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, fontFamily: FONT }}>{study.whatWeDid}</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>The Result</p>
        <p style={{ fontSize: 15, color: NAVY, fontWeight: 600, lineHeight: 1.6, fontFamily: FONT }}>{study.result}</p>
      </div>
      {study.placeholder ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#bbb", fontFamily: FONT }}>Read The Case Study →</span>
      ) : (
        <a href={study.href ?? "#"} style={{ fontSize: 13, fontWeight: 700, color: CRIMSON, fontFamily: FONT, textDecoration: "none" }}>
          Read The Case Study →
        </a>
      )}
    </div>
  );
}
