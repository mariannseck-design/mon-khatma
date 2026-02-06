import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Web Push requires VAPID keys - we'll generate them dynamically or use stored ones
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
  user_id: string
}

interface QuranGoal {
  target_value: number
  goal_type: string
  end_date: string
}

async function sendWebPush(subscription: PushSubscription, payload: object): Promise<boolean> {
  try {
    // For now, we'll use a simple fetch to the push service
    // In production, you'd use web-push library or similar
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    })
    
    console.log(`Push sent to ${subscription.endpoint}: ${response.status}`)
    return response.ok
  } catch (error) {
    console.error('Failed to send push:', error)
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, user_id } = await req.json()

    if (action === 'send_daily_reminders') {
      // Get all users with active goals and push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')

      if (subError) {
        console.error('Error fetching subscriptions:', subError)
        throw subError
      }

      console.log(`Found ${subscriptions?.length || 0} push subscriptions`)

      let sentCount = 0
      
      for (const sub of subscriptions || []) {
        // Get user's active goal
        const { data: goals } = await supabase
          .from('quran_goals')
          .select('target_value, goal_type, end_date')
          .eq('user_id', sub.user_id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        // Get today's progress
        const today = new Date().toISOString().split('T')[0]
        const { data: todayProgress } = await supabase
          .from('quran_progress')
          .select('pages_read')
          .eq('user_id', sub.user_id)
          .eq('date', today)
          .maybeSingle()

        // Prepare notification message
        let title = 'Rappel de lecture du Coran 📖'
        let body = "N'oublie pas ta lecture quotidienne du Coran!"
        
        if (goals) {
          const pagesPerDay = goals.target_value
          const todayPages = todayProgress?.pages_read || 0
          
          if (todayPages === 0) {
            body = `Tu n'as pas encore lu aujourd'hui. Objectif: ${pagesPerDay} pages/jour 🎯`
          } else if (todayPages < pagesPerDay) {
            body = `Tu as lu ${todayPages} pages. Plus que ${pagesPerDay - todayPages} pour atteindre ton objectif! 💪`
          } else {
            body = `Mashallah! Tu as atteint ton objectif de ${pagesPerDay} pages! ✨`
          }
        }

        const payload = {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'daily-quran-reminder',
          data: {
            url: '/planificateur'
          }
        }

        const success = await sendWebPush(sub, payload)
        if (success) sentCount++
      }

      return new Response(
        JSON.stringify({ success: true, sent: sentCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'send_single' && user_id) {
      // Send to a specific user
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user_id)
        .limit(1)
        .maybeSingle()

      if (!subscription) {
        return new Response(
          JSON.stringify({ success: false, error: 'No subscription found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const payload = {
        title: 'Rappel de lecture 📖',
        body: "C'est l'heure de ta lecture quotidienne du Coran!",
        icon: '/favicon.ico',
        tag: 'daily-quran-reminder',
      }

      const success = await sendWebPush(subscription, payload)
      
      return new Response(
        JSON.stringify({ success }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
