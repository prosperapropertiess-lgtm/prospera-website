import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const VALID_DOC_TYPES = ["paystub", "bank_statement", "employment_letter", "id"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("doc_type") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!docType || !VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG files are accepted" }, { status: 400 });
    }

    const ext = file.type === "application/pdf" ? "pdf"
      : file.type === "image/png" ? "png"
      : file.type === "image/webp" ? "webp"
      : "jpg";

    const filename = `temp/${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${docType}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("applications")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadErr) {
      console.error("Document upload error:", uploadErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ storage_path: filename });
  } catch (err) {
    console.error("upload-doc error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
