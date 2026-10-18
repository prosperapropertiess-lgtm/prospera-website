import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchAllProperties, fetchAllTenants, fetchRentForYear } from "@/lib/notion";

/**
 * MIGRATION ROUTE: One-time sync from Notion to Supabase
 * GET /api/admin/migrate-notion
 */
export async function GET(request: Request) {
  try {
    const sb = getSupabaseAdmin();
    
    // 1. Fetch all data from Notion
    console.log("Fetching from Notion...");
    const [properties, tenants, rentTracker] = await Promise.all([
      fetchAllProperties(),
      fetchAllTenants(),
      fetchRentForYear(2026), // We'll migrate 2026 for now, can expand later
    ]);
    
    // 2. Migrate Properties
    console.log(`Migrating ${properties.length} properties...`);
    const propertyInserts = properties.map(p => ({
      notion_id: p.id,
      name: p.name,
      address: p.address,
      city: p.city,
      type: p.type,
      status: p.status,
      monthly_rent: p.monthlyRent ?? 0,
      market_rate: p.marketRate ?? 0,
      bedrooms: p.bedrooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      notes: p.notes,
    }));
    
    const { data: insertedProperties, error: propError } = await sb
      .from('properties')
      .upsert(propertyInserts, { onConflict: 'notion_id' })
      .select('id, notion_id');
      
    if (propError) throw propError;
    
    // 3. Migrate Tenants
    console.log(`Migrating ${tenants.length} tenants...`);
    const tenantInserts = tenants.map(t => {
      // Find the new Supabase property ID based on the Notion ID
      const newPropertyId = insertedProperties?.find(p => p.notion_id === t.propertyId)?.id;
      return {
        notion_id: t.id,
        property_id: newPropertyId,
        name: t.name,
        email: t.email,
        phone: t.phone,
        monthly_rent: t.monthlyRent ?? 0,
        security_deposit: t.securityDeposit ?? 0,
        lease_start: t.leaseStart,
        lease_end: t.leaseEnd,
        status: t.status,
        notes: t.notes,
      };
    });
    
    const { data: insertedTenants, error: tenantError } = await sb
      .from('tenants')
      .upsert(tenantInserts, { onConflict: 'notion_id' })
      .select('id, notion_id');
      
    if (tenantError) throw tenantError;
    
    // 4. Migrate Rent Ledger
    console.log(`Migrating ${rentTracker.length} rent entries...`);
    const rentInserts = rentTracker.map(r => {
      const newPropertyId = insertedProperties?.find(p => p.notion_id === r.propertyId)?.id;
      const newTenantId = insertedTenants?.find(t => t.notion_id === r.tenantId)?.id;
      return {
        notion_id: r.id,
        tenant_id: newTenantId,
        property_id: newPropertyId,
        entry_title: r.entry,
        month: r.month,
        year: r.year ?? 2026,
        amount_due: r.amountDue ?? 0,
        amount_paid: r.amountPaid ?? 0,
        date_paid: r.datePaid,
        payment_status: r.paymentStatus,
        notes: r.notes,
      };
    });
    
    const { error: rentError } = await sb
      .from('rent_ledger')
      .upsert(rentInserts, { onConflict: 'notion_id' });
      
    if (rentError) throw rentError;
    
    return NextResponse.json({ 
      success: true, 
      migrated: {
        properties: properties.length,
        tenants: tenants.length,
        rentEntries: rentTracker.length
      },
      message: "Successfully migrated all data from Notion to Supabase! 🚀"
    });
    
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
