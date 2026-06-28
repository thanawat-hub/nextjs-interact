import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Connection for migrations (direct, port 5432)
export const getDirectConnection = () => {
  if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL environment variable is not set');
  }
  const connection = postgres(process.env.DIRECT_URL);
  return drizzle(connection, { schema });
};

// Connection for runtime queries (pooled, port 6543)
export const getPooledConnection = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const connection = postgres(process.env.DATABASE_URL);
  return drizzle(connection, { schema });
};

// Default export uses pooled connection (for serverless)
const connectionString = process.env.DATABASE_URL || '';
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
