import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';

const GUEST_SESSION_COOKIE = 'guest_session_id';
const GUEST_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface GuestSession {
  id: string;
  sessionId: string;
  questionsUsed: number;
  maxQuestions: number;
  expiresAt: Date;
}

/**
 * Get or create guest session
 */
export async function getOrCreateGuestSession(
  req: Request
): Promise<GuestSession> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  // If no session cookie, create new session
  if (!sessionId) {
    sessionId = uuidv4();
    
    // Extract metadata from request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || null;
    
    // Create session in database
    const expiresAt = new Date(Date.now() + GUEST_SESSION_DURATION);
    
    const { data, error } = await supabaseAdmin
      .from('guest_sessions')
      .insert({
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        questions_used: 0,
        max_questions: 2,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating guest session:', error);
      throw new Error('Failed to create guest session');
    }

    // Set cookie
    cookieStore.set(GUEST_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: GUEST_SESSION_DURATION / 1000, // in seconds
    });

    return {
      id: data.id,
      sessionId: data.session_id,
      questionsUsed: data.questions_used,
      maxQuestions: data.max_questions,
      expiresAt: new Date(data.expires_at),
    };
  }

  // Fetch existing session
  const { data, error } = await supabaseAdmin
    .from('guest_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error || !data) {
    // Session expired or invalid - create new one
    cookieStore.delete(GUEST_SESSION_COOKIE);
    return getOrCreateGuestSession(req);
  }

  // Check if session expired
  if (new Date(data.expires_at) < new Date()) {
    cookieStore.delete(GUEST_SESSION_COOKIE);
    return getOrCreateGuestSession(req);
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    questionsUsed: data.questions_used,
    maxQuestions: data.max_questions,
    expiresAt: new Date(data.expires_at),
  };
}

/**
 * Check if guest has quota remaining
 */
export function hasQuotaRemaining(session: GuestSession): boolean {
  return session.questionsUsed < session.maxQuestions;
}

/**
 * Increment guest question count
 */
export async function incrementGuestQuestions(
  sessionId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('guest_sessions')
    .update({
      questions_used: supabaseAdmin.rpc('increment', { 
        row_id: sessionId,
        column_name: 'questions_used' 
      }),
    })
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error incrementing guest questions:', error);
    throw new Error('Failed to update guest session');
  }
}

/**
 * Merge guest session to user account
 */
export async function mergeGuestToUser(
  sessionId: string,
  userId: string
): Promise<void> {
  try {
    // 1. Transfer conversations
    await supabaseAdmin
      .from('conversations')
      .update({ user_id: userId })
      .eq('session_id', sessionId);

    // 2. Transfer usage_logs
    await supabaseAdmin
      .from('usage_logs')
      .update({ user_id: userId })
      .eq('session_id', sessionId);

    // 3. Mark guest session as converted
    await supabaseAdmin
      .from('guest_sessions')
      .update({
        converted_to_user_id: userId,
        converted_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    // 4. Clear guest session cookie
    const cookieStore = await cookies();
    cookieStore.delete(GUEST_SESSION_COOKIE);
  } catch (error) {
    console.error('Error merging guest to user:', error);
    throw new Error('Failed to merge guest session');
  }
}

/**
 * Get guest session stats for admin dashboard
 */
export async function getGuestSessionStats() {
  const now = new Date().toISOString();
  
  // Active guests (not expired, not converted)
  const { count: activeCount } = await supabaseAdmin
    .from('guest_sessions')
    .select('*', { count: 'exact', head: true })
    .is('converted_to_user_id', null)
    .gt('expires_at', now);

  // Converted guests (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count: convertedCount } = await supabaseAdmin
    .from('guest_sessions')
    .select('*', { count: 'exact', head: true })
    .not('converted_to_user_id', 'is', null)
    .gte('converted_at', today.toISOString());

  // Total questions from guests (today)
  const { data: usageData } = await supabaseAdmin
    .from('usage_logs')
    .select('tokens_consumed')
    .eq('action', 'question')
    .is('user_id', null)
    .gte('created_at', today.toISOString());

  const totalQuestions = usageData?.length || 0;

  // Conversion rate
  const conversionRate = activeCount && convertedCount
    ? (convertedCount / (activeCount + convertedCount)) * 100
    : 0;

  return {
    activeGuests: activeCount || 0,
    convertedToday: convertedCount || 0,
    questionsToday: totalQuestions,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}
