import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://lennonconor.github.io";
const MAX_LEADERBOARD_LIMIT = 50;
const MAX_SUBMISSIONS_PER_MINUTE = 12;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function isAllowedOrigin(origin: string): boolean {
  return origin === ALLOWED_ORIGIN;
}

function json(data: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

function parseLimit(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "10", 10);
  if (!Number.isFinite(parsed)) {
    return 10;
  }
  return Math.min(Math.max(parsed, 1), MAX_LEADERBOARD_LIMIT);
}

function normalizeName(name: unknown): string | null {
  if (typeof name !== "string") {
    return null;
  }
  const trimmed = name.trim().slice(0, 20);
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

function normalizeScore(score: unknown): number | null {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return null;
  }
  const rounded = Math.floor(score);
  if (rounded < 0 || rounded > 10000000) {
    return null;
  }
  return rounded;
}

async function sha256(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getLeaderboard(limit: number) {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("name,score,created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }
  return data ?? [];
}

async function enforceRateLimit(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ipHash = await sha256(`${clientIp}:${userAgent}`);
  const sinceIso = new Date(Date.now() - 60_000).toISOString();

  const { count, error: countError } = await supabase
    .from("leaderboard_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", sinceIso);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= MAX_SUBMISSIONS_PER_MINUTE) {
    return false;
  }

  const { error: insertError } = await supabase.from("leaderboard_rate_limits").insert({ ip_hash: ipHash });
  if (insertError) {
    throw insertError;
  }

  return true;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (!isAllowedOrigin(origin)) {
    return json({ error: "Origin not allowed" }, 403, ALLOWED_ORIGIN);
  }

  try {
    const url = new URL(request.url);

    if (request.method === "GET") {
      const limit = parseLimit(url.searchParams.get("limit"));
      const entries = await getLeaderboard(limit);
      return json({ entries }, 200, origin);
    }

    if (request.method === "POST") {
      const rateLimitOk = await enforceRateLimit(request);
      if (!rateLimitOk) {
        return json({ error: "Too many submissions. Try again shortly." }, 429, origin);
      }

      const body = await request.json();
      const name = normalizeName(body?.name);
      const score = normalizeScore(body?.score);

      if (!name || score === null) {
        return json({ error: "Invalid payload. Expect { name, score }." }, 400, origin);
      }

      const { error: insertError } = await supabase.from("leaderboard_entries").insert({ name, score });
      if (insertError) {
        throw insertError;
      }

      const entries = await getLeaderboard(10);
      return json({ entries }, 201, origin);
    }

    return json({ error: "Method not allowed" }, 405, origin);
  } catch (error) {
    console.error("leaderboard function error", error);
    return json({ error: "Internal server error" }, 500, origin || ALLOWED_ORIGIN);
  }
});
