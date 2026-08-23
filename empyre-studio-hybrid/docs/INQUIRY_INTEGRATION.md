# Inquiry integration

## Deployment

The public form posts to `/api/inquiry`, which Netlify rewrites to `netlify/functions/inquiry.js`. Set these Netlify environment variables for the Production, Deploy Preview, and Branch deploy contexts as appropriate:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRM_LEADS_TABLE` (optional; defaults to `leads`)
- `CRM_CONTACTS_TABLE` (optional; defaults to `contacts`)
- `CRM_COMMUNICATIONS_TABLE` (optional; defaults to `communications`)
- `CRM_ACTIVITIES_TABLE` (optional; defaults to `activities`)
- `CRM_TASKS_TABLE` (optional; defaults to `tasks`)
- `CRM_INQUIRY_SUBMISSIONS_TABLE` (optional; defaults to `inquiry_submissions`)

`SUPABASE_SERVICE_ROLE_KEY` must be a server-only Netlify variable. It must not use a `VITE_` or `NEXT_PUBLIC_` prefix and must never be placed in tracked files or browser code. The function uses the Supabase REST API directly, so no package install is required.

## CRM contract and mapping

The function expects the configured tables to expose the following writable columns. Rename the table through the optional variables when the CRM uses different table names; if column names differ, update the adapter before deployment rather than relaxing validation.

| Form or server value | CRM columns |
| --- | --- |
| Name, company, email, phone, website, social URL, industry | `full_name`, `business_name`, `email`, `phone`, `website`, `social_url`, `industry` |
| Service, investment range, timeline | `service_interest`, `budget`, `timeline` |
| Project change, additional context | `primary_challenge`, `message` |
| Form name, page, referrer, UTM values | `form_name`, `landing_page_url`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` |
| Server timestamp | `submitted_at`, `received_at`, `occurred_at`, `last_contact_at` as applicable |
| New lead defaults | `stage = New Inquiry`, `lead_source = Website Inquiry` |

The inquiry table also needs `sync_status` and `lead_id`; these preserve a durable pending record if a later CRM write fails. The other tables need the relationship and workflow columns used by the function (`lead_id`, `contact_id`, task `status`, `priority`, and `due_at`).

Duplicate matching checks normalized email first. If no email match exists, it checks case-insensitive business name candidates and compares the normalized website domain. Existing leads are never overwritten except for `last_contact_at`; new data is recorded as the new communication and inquiry submission.

## Failure and recovery

The function creates an inquiry submission with `sync_status = pending` before creating or updating related records. Any failure is logged server-side with a request ID and a generic error is returned to the browser. No CRM response, record ID, database error, or secret is returned publicly. The function does not claim success when a write fails.

Recovery: inspect the Netlify Function logs for `CRM inquiry sync failed`, locate the matching pending row in `inquiry_submissions`, correct the schema/configuration issue, then replay the submission through the CRM’s normal internal tooling or complete the missing related records manually. This endpoint intentionally has no public retry-by-ID operation.

Rate limiting is an in-memory limit of five requests per IP per 15 minutes per warm function instance. Keep upstream Netlify/WAF controls enabled for stronger distributed protection.

## Manual test checklist

1. With valid Netlify variables, open `/contact/`, complete both steps, submit once, and confirm the exact success message: `Thank you. Your inquiry has been received. Empyré Studio will be in touch shortly.`
2. In Supabase, confirm one inquiry submission, one lead/contact as needed, one inbound communication, one activity, and one high-priority open task due the next day.
3. Submit the same email again. Confirm no lead fields are overwritten, a new communication/submission is added, `last_contact_at` changes, and no equivalent open follow-up task is added.
4. Leave a required field empty. Confirm visible validation text appears and focus moves to the error summary/invalid control.
5. Submit twice quickly. Confirm the button is disabled only while the request is pending.
6. Fill the hidden honeypot using browser developer tools. Confirm the public response is generic and no CRM row is created.
7. Temporarily remove or invalidate the service key. Confirm the generic error message appears and the server log contains only the safe failure message and request ID.
8. Verify the browser network panel contains no Supabase request and no secret values.

No Supabase schema or RLS policy change is required when these tables/columns already exist: the service-role key is used only inside the Netlify Function and therefore bypasses table RLS server-side. Keep RLS enabled; do not grant the public browser role access to CRM tables.