import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { parseEmailWebhookPayload } from 'npm:@lovable.dev/email-js'
import { WebhookError, verifyWebhookRequest } from 'npm:@lovable.dev/webhooks-js'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-lovable-signature, x-lovable-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirme ton email 🌿',
  invite: 'Tu es invitée à rejoindre Ma Khatma',
  magiclink: 'Ton lien de connexion',
  recovery: 'Réinitialise ton mot de passe',
  email_change: 'Confirme ton changement d\'email',
  reauthentication: 'Ton code de vérification',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = "Ma Khatma"
const SENDER_DOMAIN = "notify.makhatma.com"
const ROOT_DOMAIN = "makhatma.com"
const FROM_DOMAIN = "notify.makhatma.com" // Domain shown in From address (may be root or sender subdomain)

// Sample data for preview mode ONLY (not used in actual email sending).
// URLs are baked in at scaffold time from the project's real data.
// The sample email uses a fixed placeholder (RFC 6761 .test TLD) so the Go backend
// can always find-and-replace it with the actual recipient when sending test emails,
// even if the project's domain has changed since the template was scaffolded.
const SAMPLE_PROJECT_URL = "https://makhatma.lovable.app"
const SAMPLE_EMAIL = "user@example.test"
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

type UnknownRecord = Record<string, unknown>

type NormalizedHookPayload = {
  rawEmailType: string | null
  emailType: string | null
  recipientEmail: string | null
  confirmationUrl: string | null
  token: string | null
  newEmail: string | null
}

const EMAIL_TYPE_ALIASES: Record<string, string> = {
  email: 'signup',
  confirm_signup: 'signup',
  email_verification: 'signup',
  email_confirmation: 'signup',
  confirmation: 'signup',
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {}
}

function pickFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return null
}

function normalizeEmailType(rawType: string | null): string | null {
  if (!rawType) return null
  const normalized = rawType.trim().toLowerCase()
  return EMAIL_TYPE_ALIASES[normalized] ?? normalized
}

function toVerifyType(emailType: string): string {
  const normalized = normalizeEmailType(emailType) ?? emailType
  return normalized === 'signup' ? 'signup' : normalized
}

function buildConfirmationUrl(params: {
  providedUrl: string | null
  tokenHash: string | null
  emailType: string | null
  redirectTo: string | null
}): string | null {
  if (params.providedUrl) return params.providedUrl
  if (!params.tokenHash || !params.emailType) return null

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl) return null

  const url = new URL(`${supabaseUrl}/auth/v1/verify`)
  url.searchParams.set('token_hash', params.tokenHash)
  url.searchParams.set('type', toVerifyType(params.emailType))
  if (params.redirectTo) {
    url.searchParams.set('redirect_to', params.redirectTo)
  }

  return url.toString()
}

function normalizePayload(payload: unknown): NormalizedHookPayload {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const emailData = asRecord(data.email_data ?? root.email_data)
  const userData = asRecord(data.user ?? root.user)

  const rawEmailType = pickFirstString(
    data.action_type,
    data.email_action_type,
    emailData.email_action_type,
    root.action_type,
    root.email_action_type,
  )

  const emailType = normalizeEmailType(rawEmailType)

  const recipientEmail = pickFirstString(
    data.email,
    emailData.email,
    userData.email,
    root.email,
  )

  const token = pickFirstString(data.token, emailData.token, root.token)
  const tokenHash = pickFirstString(data.token_hash, emailData.token_hash, root.token_hash)
  const redirectTo = pickFirstString(data.redirect_to, emailData.redirect_to, root.redirect_to)
  const providedUrl = pickFirstString(
    data.url,
    data.confirmation_url,
    emailData.action_link,
    emailData.url,
    root.url,
  )

  return {
    rawEmailType,
    emailType,
    recipientEmail,
    confirmationUrl: buildConfirmationUrl({
      providedUrl,
      tokenHash,
      emailType: rawEmailType ?? emailType,
      redirectTo,
    }),
    token,
    newEmail: pickFirstString(data.new_email, emailData.new_email, root.new_email),
  }
}

// Preview endpoint handler - returns rendered HTML without sending email
async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// Webhook handler - verifies signature and sends email
async function handleWebhook(req: Request): Promise<Response> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')

  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify signature + timestamp, then parse payload.
  let payload: any
  let run_id = ''
  try {
    const verified = await verifyWebhookRequest({
      req,
      secret: apiKey,
      parser: parseEmailWebhookPayload,
    })
    payload = verified.payload
    run_id = payload.run_id
  } catch (error) {
    if (error instanceof WebhookError) {
      switch (error.code) {
        case 'invalid_signature':
        case 'missing_timestamp':
        case 'invalid_timestamp':
        case 'stale_timestamp':
          console.error('Invalid webhook signature', { error: error.message })
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        case 'invalid_payload':
        case 'invalid_json':
          console.error('Invalid webhook payload', { error: error.message })
          return new Response(
            JSON.stringify({ error: 'Invalid webhook payload' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    }

    console.error('Webhook verification failed', { error })
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!run_id) {
    run_id = crypto.randomUUID()
    console.warn('Webhook payload missing run_id, generated fallback', { run_id })
  }

  if (payload.version && payload.version !== '1') {
    console.warn('Unexpected payload version', { version: payload.version, run_id })
  }

  const normalized = normalizePayload(payload)
  const emailType = normalized.emailType

  if (!emailType) {
    console.error('Webhook payload missing email action type', { run_id })
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload: missing email action type' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  console.log('Received auth event', {
    emailType,
    rawEmailType: normalized.rawEmailType,
    email: normalized.recipientEmail,
    run_id,
  })

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.log('Skipping unsupported auth email type', {
      emailType,
      rawEmailType: normalized.rawEmailType,
      run_id,
    })
    return new Response(
      JSON.stringify({ success: true, skipped: true, reason: 'unsupported_email_type' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!normalized.recipientEmail) {
    console.error('Webhook payload missing recipient email', { emailType, run_id })
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload: missing recipient email' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (emailType !== 'reauthentication' && !normalized.confirmationUrl) {
    console.error('Webhook payload missing confirmation URL', { emailType, run_id })
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload: missing confirmation URL' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Build template props from normalized hook payload
  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: normalized.recipientEmail,
    confirmationUrl: normalized.confirmationUrl ?? `https://${ROOT_DOMAIN}`,
    token: normalized.token,
    email: normalized.recipientEmail,
    newEmail: normalized.newEmail,
  }

  // Render React Email to HTML and plain text
  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  // Enqueue email for async processing by the dispatcher (process-email-queue).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const recipientEmail = normalized.recipientEmail
  const messageId = crypto.randomUUID()

  // Log pending BEFORE enqueue so we have a record even if enqueue crashes
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      run_id,
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, run_id, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Auth email enqueued', { emailType, email: recipientEmail, run_id })

  return new Response(
    JSON.stringify({ success: true, queued: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Handle CORS preflight for main endpoint
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route to preview handler for /preview path
  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  // Main webhook handler
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
