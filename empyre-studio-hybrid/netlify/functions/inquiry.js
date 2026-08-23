const rateBuckets = new Map();

const MAX_LENGTHS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  website: 2048,
  socialUrl: 2048,
  industry: 120,
  service: 120,
  budget: 160,
  timeline: 120,
  primaryChallenge: 4000,
  message: 8000,
  formName: 80,
  landingPageUrl: 2048,
  referrer: 2048,
  utmSource: 120,
  utmMedium: 120,
  utmCampaign: 160,
  utmTerm: 160,
  utmContent: 160,
};

const tableNames = {
  leads: process.env.CRM_LEADS_TABLE || "leads",
  contacts: process.env.CRM_CONTACTS_TABLE || "contacts",
  communications: process.env.CRM_COMMUNICATIONS_TABLE || "communications",
  activities: process.env.CRM_ACTIVITIES_TABLE || "activities",
  tasks: process.env.CRM_TASKS_TABLE || "tasks",
  inquiries: process.env.CRM_INQUIRY_SUBMISSIONS_TABLE || "inquiry_submissions",
};

const response = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  body: JSON.stringify(body),
});

const publicError = () => response(500, { ok: false, error: "Your inquiry could not be sent right now. Please try again shortly." });

const clean = (value, maxLength) => String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength);

const getBody = (event) => {
  const raw = event.body || "{}";
  if ((event.headers["content-type"] || "").includes("application/json")) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
};

const normalizeUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch (_) {
    return "";
  }
};

const domainOf = (value) => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch (_) { return ""; }
};

const limited = (ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const bucket = rateBuckets.get(ip) || { count: 0, started: now };
  if (now - bucket.started > windowMs) { bucket.count = 0; bucket.started = now; }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return bucket.count > 5;
};

const supabaseRequest = async (table, options = {}) => {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) throw new Error("CRM environment is not configured");
  const url = new URL(`/rest/v1/${table}`, baseUrl);
  Object.entries(options.query || {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const result = await fetch(url, {
    method: options.method || "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      Prefer: options.prefer || "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!result.ok) throw new Error(`CRM request failed with status ${result.status}`);
  return result.status === 204 ? [] : result.json();
};

const insert = (table, body) => supabaseRequest(table, { method: "POST", body });
const update = (table, query, body) => supabaseRequest(table, { method: "PATCH", query, body });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Method not allowed." });
  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"]?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return response(429, { ok: false, error: "Your inquiry could not be sent right now. Please try again shortly." });

  try {
    const raw = getBody(event);
    if (clean(raw["company-site-confirmation"], 200)) return response(200, { ok: true });

    const email = clean(raw.email, MAX_LENGTHS.email).toLowerCase();
    const website = normalizeUrl(clean(raw.website, MAX_LENGTHS.website));
    const fields = {
      fullName: clean(raw.name, MAX_LENGTHS.name),
      businessName: clean(raw.company, MAX_LENGTHS.company),
      email,
      phone: clean(raw.phone, MAX_LENGTHS.phone),
      website,
      socialUrl: normalizeUrl(clean(raw["social-url"], MAX_LENGTHS.socialUrl)),
      industry: clean(raw.industry, MAX_LENGTHS.industry),
      service: clean(raw.service, MAX_LENGTHS.service),
      budget: clean(raw["investment-range"], MAX_LENGTHS.budget),
      timeline: clean(raw.timeline, MAX_LENGTHS.timeline),
      primaryChallenge: clean(raw["project-change"], MAX_LENGTHS.primaryChallenge),
      message: clean(raw["additional-context"], MAX_LENGTHS.message),
      formName: clean(raw["form-name"] || "project-inquiry", MAX_LENGTHS.formName),
      landingPageUrl: normalizeUrl(clean(raw["landing-page-url"], MAX_LENGTHS.landingPageUrl)),
      referrer: clean(raw.referrer || raw["referral-source"], MAX_LENGTHS.referrer),
      utmSource: clean(raw["utm-source"], MAX_LENGTHS.utmSource),
      utmMedium: clean(raw["utm-medium"], MAX_LENGTHS.utmMedium),
      utmCampaign: clean(raw["utm-campaign"], MAX_LENGTHS.utmCampaign),
      utmTerm: clean(raw["utm-term"], MAX_LENGTHS.utmTerm),
      utmContent: clean(raw["utm-content"], MAX_LENGTHS.utmContent),
    };
    const required = [fields.fullName, fields.businessName, fields.email, fields.primaryChallenge, fields.service, fields.timeline, fields.budget];
    if (required.some((value) => !value) || !/^\S+@\S+\.\S+$/.test(fields.email) || raw["privacy-consent"] !== "on" && raw["privacy-consent"] !== true) {
      return response(400, { ok: false, error: "Please review the required fields and try again." });
    }
    if ((raw.website && !website) || (raw["social-url"] && !fields.socialUrl) || (raw["landing-page-url"] && !fields.landingPageUrl)) {
      return response(400, { ok: false, error: "Please review the required fields and try again." });
    }

    const submittedAt = new Date().toISOString();
    const domain = domainOf(fields.website);
    const existingByEmail = await supabaseRequest(tableNames.leads, { query: { select: "*", email: `eq.${fields.email}`, limit: "1" } });
    let existing = existingByEmail[0];
    if (!existing && domain && fields.businessName) {
      const candidates = await supabaseRequest(tableNames.leads, { query: { select: "*", business_name: `ilike.${fields.businessName}`, limit: "20" } });
      existing = candidates.find((lead) => domainOf(lead.website) === domain);
    }

    const inquiry = (await insert(tableNames.inquiries, {
      full_name: fields.fullName, business_name: fields.businessName, email: fields.email, phone: fields.phone,
      website: fields.website, social_url: fields.socialUrl, industry: fields.industry, service_interest: fields.service,
      budget: fields.budget, timeline: fields.timeline, primary_challenge: fields.primaryChallenge, message: fields.message,
      form_name: fields.formName, landing_page_url: fields.landingPageUrl, referrer: fields.referrer,
      utm_source: fields.utmSource, utm_medium: fields.utmMedium, utm_campaign: fields.utmCampaign, utm_term: fields.utmTerm,
      utm_content: fields.utmContent, submitted_at: submittedAt, sync_status: "pending", lead_id: existing?.id || null,
    }))[0];

    let lead = existing;
    let contact;
    if (!lead) {
      lead = (await insert(tableNames.leads, {
        full_name: fields.fullName, business_name: fields.businessName, email: fields.email, phone: fields.phone,
        website: fields.website, social_url: fields.socialUrl, industry: fields.industry, service_interest: fields.service,
        budget: fields.budget, timeline: fields.timeline, primary_challenge: fields.primaryChallenge,
        stage: "New Inquiry", lead_source: "Website Inquiry", last_contact_at: submittedAt,
      }))[0];
    } else {
      await update(tableNames.leads, { id: `eq.${lead.id}` }, { last_contact_at: submittedAt });
    }
    contact = (await supabaseRequest(tableNames.contacts, { query: { select: "*", email: `eq.${fields.email}`, limit: "1" } }))[0];
    if (!contact) contact = (await insert(tableNames.contacts, { lead_id: lead.id, full_name: fields.fullName, business_name: fields.businessName, email: fields.email, phone: fields.phone }))[0];
    await insert(tableNames.communications, { lead_id: lead.id, contact_id: contact?.id || null, direction: "inbound", channel: "website", subject: "Website inquiry", body: `${fields.primaryChallenge}\n\n${fields.message}`.trim(), received_at: submittedAt, source: "Website Inquiry" });
    await insert(tableNames.activities, { lead_id: lead.id, contact_id: contact?.id || null, activity_type: "Website inquiry received", description: "New inquiry submitted through the public website.", occurred_at: submittedAt });
    const openTasks = await supabaseRequest(tableNames.tasks, { query: { select: "id", lead_id: `eq.${lead.id}`, status: "in.(open,pending)" } });
    if (!openTasks.length) {
      const due = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await insert(tableNames.tasks, { lead_id: lead.id, contact_id: contact?.id || null, title: "Follow up on website inquiry", priority: "high", status: "open", due_at: due.toISOString(), source: "Website Inquiry" });
    }
    await update(tableNames.inquiries, { id: `eq.${inquiry.id}` }, { lead_id: lead.id, sync_status: "complete", synced_at: new Date().toISOString() });
    return response(200, { ok: true, message: "Thank you. Your inquiry has been received. Empyré Studio will be in touch shortly." });
  } catch (error) {
    console.error("CRM inquiry sync failed", { message: error?.message || "unknown error", requestId: event.requestContext?.requestId || "unknown" });
    return publicError();
  }
};