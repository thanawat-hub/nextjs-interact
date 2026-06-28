import { NextResponse } from 'next/server';

/**
 * Health check endpoint for auth configuration
 * Returns whether auth is properly configured
 */
export async function GET() {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GITHUB_CLIENT_ID
  );

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? 'Authentication is fully configured'
      : 'Authentication requires Supabase and OAuth credentials',
    providers: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID),
      github: Boolean(process.env.GITHUB_CLIENT_ID),
    },
    database: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
  });
}
