// TODO: Phase 2 Auth - Complete after Supabase setup
// NextAuth v5 beta API is different - will be implemented after database is ready

import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

export type UserRole = 'admin' | 'member' | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

/**
 * Get current user session with role
 * TODO: Implement with NextAuth v5 after Supabase is configured
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Placeholder - will be implemented in Phase 2.2
  console.warn('Auth not fully configured - returning null');
  return null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  
  return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(['admin']);
}

/**
 * Check if user has role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * API route wrapper for auth protection
 */
export function withAuth(
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      const user = await requireAuth();
      return handler(req, user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      throw error;
    }
  };
}

/**
 * API route wrapper for role-based protection
 */
export function withRole(
  allowedRoles: UserRole[],
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      const user = await requireRole(allowedRoles);
      return handler(req, user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        if (error.message === 'Forbidden') {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }
      }
      throw error;
    }
  };
}

/**
 * API route wrapper for admin-only routes
 */
export function withAdmin(
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return withRole(['admin'], handler);
}
