// TODO: Phase 2 Auth - Configure after Supabase setup
// NextAuth v5 beta has different type exports
// Will be properly implemented once Supabase database is set up

import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { SupabaseAdapter } from '@auth/supabase-adapter';

// Check if all required env vars are present
const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GITHUB_CLIENT_ID
);

if (!isAuthConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Auth not fully configured. Set up Supabase and OAuth credentials in .env.local');
}

export const authOptions: any = {
  // Only use adapter if Supabase is configured
  ...(isAuthConfigured && {
    adapter: SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'not-configured',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (!session) return session;
      
      if (session.user && token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role || 'member';
      }
      return session;
    },
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.sub = user.id;
        token.role = 'member'; // Default role
      }
      
      // Only fetch from database if Supabase is configured
      if ((trigger === 'signIn' || trigger === 'update') && isAuthConfigured) {
        try {
          const { supabaseAdmin } = await import('./supabase');
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('role')
            .eq('user_id', token.sub)
            .single();
          
          token.role = profile?.role || 'member';
        } catch (error) {
          console.error('Error fetching user role:', error);
          token.role = 'member';
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  // Disable automatic API routes if auth not configured
  ...(isAuthConfigured ? {} : {
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  }),
};
