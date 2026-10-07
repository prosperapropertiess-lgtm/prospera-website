/**
 * Agent-driven property intake.
 *
 * This is how Claude creates a listing directly from a chat message — Ebin
 * describes a property (and drops photos), Claude writes a config JSON file
 * matching AgentPropertyInput below, then runs this script. It drives the
 * exact same authenticated admin API the PropertyWizard UI uses (login →
 * create → upload photos → update → optionally publish), so every real
 * side effect (storage conventions, agent-notification emails, Notion sync
 * on publish) runs through the real, already-tested code path. No new
 * backdoor endpoint, no DB writes that skip business logic.
 *
 * Usage:
 *   npx tsx scripts/agent-create-property.ts path/to/config.json
 *
 * Config shape — see AgentPropertyInput. `photos` is an array of local
 * absolute file paths (e.g. where Ebin's dropped chat images get saved).
 * Only `address`, `city`, `price`, `bedrooms`, `bathrooms` are required —
 * everything else has a sane default so a bare-minimum "406 Vermont Ave,
 * $2595, 5bd/2ba house" message is enough to produce a working draft.
 */

import { readFileSync } from "fs";
import { basename } from "path";

// The apex domain 301-redirects to www, which silently downgrades POST to
// GET per fetch spec — always hit www directly to avoid that trap.
const BASE_URL = process.env.AGENT_SITE_BASE_URL || "https://www.prosperaproperties.co";

interface AgentPropertyInput {
  address: string;
  city?: string; // default "London"
  property_type?: string; // house | apartment | condo | townhouse | duplex | triplex | other
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  available_date?: string; // "YYYY-MM-DD"
  deposit?: number;
  parking?: boolean;
  parking_type?: string;
  laundry_type?: string; // "in-unit" | "shared" | "coin-op" | "none"
  ac?: boolean;
  heating_type?: string;
  appliances?: string[];
  outdoor_space?: string;
  furnished?: boolean;
  pet_friendly?: boolean;
  utilities_included?: boolean;
  utilities_list?: string[];
  description?: string; // written by Claude, following COPYWRITING.md
  ai_highlights?: string[]; // written by Claude, 3-5 short "why this home" lines
  photos?: string[]; // local absolute file paths, in upload order
  /** Set true only when Ebin has actually said to publish — defaults to a private draft. */
  publish?: boolean;
}

function fail(msg: string): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

async function main() {
  const configPath = process.argv[2];
  if (!configPath) fail("Usage: npx tsx scripts/agent-create-property.ts <config.json>");

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) fail("ADMIN_PASSWORD not set in the environment this script runs with.");

  const input: AgentPropertyInput = JSON.parse(readFileSync(configPath, "utf-8"));
  if (!input.address || !input.price || !input.bedrooms || !input.bathrooms) {
    fail("Config must include at least address, price, bedrooms, bathrooms.");
  }

  // 1. Log in as admin — real login flow, real rate limiting, real cookie.
  console.log("→ Logging in...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: adminPassword }),
  });
  if (!loginRes.ok) fail(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  const setCookie = loginRes.headers.get("set-cookie");
  const sessionCookie = setCookie?.split(";")[0];
  if (!sessionCookie) fail("Login succeeded but no session cookie was returned.");

  const authHeaders = { Cookie: sessionCookie, "Content-Type": "application/json" };

  // 2. Create the property — draft by default (status defaults to "draft"
  //    server-side when omitted, matching the wizard's own behaviour).
  console.log("→ Creating property record...");
  const createPayload: Record<string, unknown> = {
    title: `${input.bedrooms} Bedroom ${input.property_type ? input.property_type.charAt(0).toUpperCase() + input.property_type.slice(1) : "Home"} — ${input.city || "London"}`,
    address: input.address,
    city: input.city || "London",
    property_type: input.property_type || null,
    price: input.price,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sqft: input.sqft ?? null,
    available_date: input.available_date ?? null,
    deposit: input.deposit ?? input.price,
    first_month_required: true,
    last_month_required: true,
    move_in_costs: [],
    parking: input.parking ?? (input.parking_type ? input.parking_type !== "none" : false),
    parking_type: input.parking_type ?? "none",
    laundry_type: input.laundry_type ?? "none",
    ac: input.ac ?? false,
    heating_type: input.heating_type ?? null,
    appliances: input.appliances ?? [],
    outdoor_space: input.outdoor_space ?? "none",
    furnished: input.furnished ?? false,
    storage: false,
    elevator: false,
    wheelchair_accessible: false,
    pet_friendly: input.pet_friendly ?? false,
    utilities_included: input.utilities_included ?? false,
    utilities_list: input.utilities_list ?? [],
    description: input.description ?? null,
    ai_highlights: input.ai_highlights ?? [],
    available: true,
    wizard_step: 8,
    status: input.publish ? "published" : "draft",
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/properties`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(createPayload),
  });
  if (!createRes.ok) fail(`Create failed: ${createRes.status} ${await createRes.text()}`);
  const property = await createRes.json();
  const propertyId = property.id as string;
  console.log(`  ✓ Created ${propertyId}`);

  // 3. Upload photos, if any — same endpoint, same storage bucket/path
  //    convention as the wizard's PhotosStep.
  const imageUrls: string[] = [];
  for (const photoPath of input.photos ?? []) {
    console.log(`→ Uploading ${basename(photoPath)}...`);
    const bytes = readFileSync(photoPath);
    const ext = (photoPath.split(".").pop() || "jpg").toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "heic" || ext === "heif" ? "image/heic" : "image/jpeg";
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mime }), basename(photoPath));
    form.append("propertyId", propertyId);

    const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: form,
    });
    if (!uploadRes.ok) {
      console.error(`  ✗ Upload failed for ${photoPath}: ${uploadRes.status} ${await uploadRes.text()}`);
      continue;
    }
    const { url } = await uploadRes.json();
    imageUrls.push(url);
    console.log(`  ✓ ${url}`);
  }

  // 4. Attach the uploaded image URLs to the property.
  if (imageUrls.length) {
    console.log("→ Attaching photos to property...");
    const updateRes = await fetch(`${BASE_URL}/api/admin/properties/${propertyId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ images: imageUrls }),
    });
    if (!updateRes.ok) fail(`Attaching photos failed: ${updateRes.status} ${await updateRes.text()}`);
  }

  // 5. Publish, if requested — the real publish route (Notion sync included).
  if (input.publish) {
    console.log("→ Publishing...");
    const pubRes = await fetch(`${BASE_URL}/api/admin/properties/${propertyId}/publish`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    if (!pubRes.ok) fail(`Publish failed: ${pubRes.status} ${await pubRes.text()}`);
    console.log("  ✓ Published");
  }

  const agentId = "08e1618d-562a-4227-a6d7-fb5c981f52bb"; // Ebin Jaison — the only active agent
  console.log("\n" + "=".repeat(60));
  console.log(`Property ID:   ${propertyId}`);
  console.log(`Status:        ${input.publish ? "published (live)" : "draft (private, not listed)"}`);
  console.log(`Preview link:  ${BASE_URL}/listings/${propertyId}`);
  console.log(`Apply link:    ${BASE_URL}/apply/${agentId}/${propertyId}`);
  console.log("=".repeat(60) + "\n");
}

main().catch((err) => fail(err?.message || String(err)));
