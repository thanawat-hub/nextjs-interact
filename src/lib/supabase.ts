import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client-side client with anon key (respects RLS)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Vector similarity search function
export async function searchKnowledgeChunks(
  queryEmbedding: number[],
  matchThreshold = 0.7,
  matchCount = 5
) {
  const { data, error } = await supabaseAdmin.rpc('match_knowledge_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('Error searching knowledge chunks:', error);
    throw error;
  }

  return data;
}
