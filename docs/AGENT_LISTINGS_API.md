# Agent Listings API

A small, API-key-authenticated API that lets an external AI agent (ChatGPT
Custom GPT, or anything else that can make HTTP requests) create, edit, and
remove property listings on prosperaproperties.co — no browser, no admin
login, no session cookie.

## Getting a key

Go to `/admin/api-keys` while logged into the admin panel, give the key a
label (e.g. "ChatGPT listings agent"), and click **Generate Key**. The full
key is shown exactly once — copy it immediately. You can revoke a key any
time from the same page; revoking takes effect immediately and can't be
undone (generate a new one if you need it back).

## Auth

Every endpoint below (except the public `GET /api/listings`) requires:

```
Authorization: Bearer pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

A missing, malformed, or revoked key returns `401`.

## Base URL

```
https://www.prosperaproperties.co
```

(Use `www` — the bare domain 301-redirects there, which breaks POST/PATCH/DELETE.)

---

## `POST /api/listings` — create a listing

Required fields: `address`, `city`, `price`, `bedrooms`, `bathrooms`.
Everything else is optional and defaults sensibly. New listings are created
as **private drafts** (`status: "draft"`) unless you explicitly pass
`"status": "published"` — a draft never appears on the public site or
`/listings`, but still gets a real, working apply link.

```bash
curl -X POST https://www.prosperaproperties.co/api/listings \
  -H "Authorization: Bearer pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "address": "148 Elm St",
    "city": "London",
    "price": 2100,
    "bedrooms": 3,
    "bathrooms": 2,
    "property_type": "house",
    "sqft": 1400,
    "available_date": "2026-12-01",
    "description": "A bright, updated 3-bedroom home close to downtown...",
    "ai_highlights": ["Freshly renovated kitchen", "Fenced backyard", "2 minutes from transit"],
    "laundry_type": "in-unit",
    "parking_type": "driveway",
    "pet_friendly": true,
    "utilities_included": false,
    "image_urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    "status": "draft"
  }'
```

`image_urls` — any externally-hosted photo URLs. The server downloads each
one and re-hosts it in Prospera's own storage (external URLs aren't
permanent, so listings never depend on them staying online). Response
includes `image_errors` if any individual photo failed to download — the
listing itself is still created either way.

Response: the created property row (same shape as `GET /api/listings`),
plus `id` — you'll need it for the next calls.

### Full field reference

| Field | Type | Default |
|---|---|---|
| `address` | string | **required** |
| `city` | string | **required** |
| `price` | number | **required** |
| `bedrooms` | number | **required** |
| `bathrooms` | number | **required** |
| `property_type` | `house`\|`apartment`\|`condo`\|`townhouse`\|`duplex`\|`triplex`\|`other` | `null` |
| `sqft` | number | `null` |
| `available_date` | `"YYYY-MM-DD"` | `null` |
| `deposit` | number | equal to `price` |
| `parking_type` | `none`\|`street`\|`driveway`\|`garage`\|`underground`\|`lot` | `none` |
| `laundry_type` | `none`\|`in-unit`\|`shared`\|`coin-op` | `none` |
| `ac` | boolean | `false` |
| `heating_type` | string | `null` |
| `appliances` | string[] | `[]` |
| `outdoor_space` | `none`\|`balcony`\|`patio`\|`yard`\|`rooftop`\|`deck` | `none` |
| `furnished` | boolean | `false` |
| `pet_friendly` | boolean | `false` |
| `utilities_included` | boolean | `false` |
| `utilities_list` | string[] | `[]` |
| `description` | string | `null` |
| `ai_highlights` | string[] | `[]` |
| `image_urls` | string[] | — (download + re-host) |
| `images` | string[] | — (already-hosted URLs, used as-is) |
| `status` | `draft`\|`published` | `draft` |

### Accepted aliases (in case your agent guesses a different name)

These all get mapped onto the canonical field above automatically — no need
to use them, but they won't be silently dropped if your agent does:

| You send | Mapped to |
|---|---|
| `pets_allowed`, `pet_allowed`, `petFriendly`, `pets`, `allows_pets` | `pet_friendly` |
| `laundry`, `laundryType` | `laundry_type` |
| `availability_date`, `availableDate`, `available_from`, `move_in_date`, `moveInDate` | `available_date` |
| `outdoorSpace` | `outdoor_space` |
| `backyard: true`, `yard: true`, `balcony: true`, `patio: true`, `deck: true`, `rooftop: true` | adds to `outdoor_space` |
| `appliances: {dishwasher: true, fridge: true, ...}` (object instead of array) | converted to `appliances: ["Dishwasher", "Refrigerator", ...]` |

### Anything else you send that isn't recognized

The response includes an `unrecognized_fields` object listing any top-level
field that didn't match a known name or alias — so a typo or a guessed field
name shows up immediately instead of silently doing nothing:

```json
"unrecognized_fields": {
  "fields": ["pet_allowd"],
  "note": "These fields were not recognized and were ignored. See docs/AGENT_LISTINGS_API.md for exact field names."
}
```

---

## `GET /api/listings/:id` — fetch one listing

Returns every column, regardless of status (the public `GET /api/listings`
only returns published/available properties — this one doesn't filter).

```bash
curl https://www.prosperaproperties.co/api/listings/<id> \
  -H "Authorization: Bearer pk_live_..."
```

---

## `PATCH /api/listings/:id` — edit a listing

Same fields as create, all optional — only what you send gets changed.
Send `"status": "published"` here to publish a draft (runs the same publish
logic as the admin wizard, including the Notion sync and agent-notify
emails that fire on a real publish).

```bash
curl -X PATCH https://www.prosperaproperties.co/api/listings/<id> \
  -H "Authorization: Bearer pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"price": 2050, "status": "published"}'
```

`image_urls` on PATCH *appends* to existing photos (download + re-host,
same as create). Pass `images` instead if you want to replace the full
photo list yourself.

---

## `DELETE /api/listings/:id` — remove a listing

Deletes the property row and its stored photos. Not recoverable.

```bash
curl -X DELETE https://www.prosperaproperties.co/api/listings/<id> \
  -H "Authorization: Bearer pk_live_..."
```

---

## `POST /api/uploads` — upload a photo directly

Use this instead of `image_urls` when the agent has raw image bytes rather
than a hosted URL (e.g. an image attached directly in a chat).

```bash
curl -X POST https://www.prosperaproperties.co/api/uploads \
  -H "Authorization: Bearer pk_live_..." \
  -F "file=@photo.jpg" \
  -F "propertyId=<id>"
```

Response: `{"url": "https://.../property-images/properties/<id>/....jpg"}`.
Add the returned URL(s) to `images` on a follow-up `PATCH`.

---

## `POST /api/listings/:id/invite` — email a prospect their application link

Sends a branded "start your application" email straight to a prospective
tenant, linking into the real application flow for that property.

```bash
curl -X POST https://www.prosperaproperties.co/api/listings/<property id>/invite \
  -H "Authorization: Bearer pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"tenant_name": "Jane Smith", "tenant_email": "jane@email.com"}'
```

Response: `{"success": true, "applyUrl": "...", "agentId": "...", "propertyAddress": "..."}`.
Fails with a clear message if the property doesn't exist, isn't currently
set up to accept applications (`is_managed`/`available`), or email sending
isn't configured.

---

## Apply link

Every property gets a tenant application link once it exists (draft or
published — the apply flow only checks `is_managed`/`available`, not
publish status):

```
https://www.prosperaproperties.co/apply/08e1618d-562a-4227-a6d7-fb5c981f52bb/<property id>
```

(`08e1618d-...` is Ebin's agent id — the only active agent. This isn't
returned by the API yet; construct it from the property id you get back.)
