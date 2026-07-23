// Lemon-Squeezy-Webhook → trägt Käufe in die purchases-Tabelle ein.
// Deploy (nach Robertos Handgriffen): supabase functions deploy ls-webhook --no-verify-jwt
// In Lemon Squeezy: Webhook auf https://<projekt>.supabase.co/functions/v1/ls-webhook
// Secret: LS_WEBHOOK_SECRET als Function-Secret setzen (supabase secrets set).
import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();

async function validSignature(payload: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === signature.toLowerCase();
}

Deno.serve(async (req) => {
  const payload = await req.text();
  const sig = req.headers.get("X-Signature") ?? "";
  const secret = Deno.env.get("LS_WEBHOOK_SECRET") ?? "";
  if (!secret || !(await validSignature(payload, sig, secret))) {
    return new Response("invalid signature", { status: 401 });
  }
  const event = JSON.parse(payload);
  if (event?.meta?.event_name !== "order_created") {
    return new Response("ignored", { status: 200 });
  }
  const attr = event?.data?.attributes ?? {};
  const email = (attr.user_email ?? "").toLowerCase();
  const orderId = String(event?.data?.id ?? "");
  // Produkt-Zuordnung: custom_data.slug (beim Anlegen des Checkout-Links setzen)
  const slug = event?.meta?.custom_data?.slug ?? attr.first_order_item?.product_name ?? "";
  if (!email || !orderId || !slug) return new Response("missing fields", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await supabase.from("purchases").upsert(
    { user_email: email, product_slug: slug, ls_order_id: orderId },
    { onConflict: "ls_order_id" },
  );
  if (error) return new Response(`db error: ${error.message}`, { status: 500 });
  return new Response("ok", { status: 200 });
});
