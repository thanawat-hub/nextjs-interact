export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <main className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Ask Tor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Chat with my AI avatar powered by RAG
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/chat"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Chatting
          </a>
          <a
            href="/login"
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Sign In
          </a>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          <p>
            ⚠️ <strong>Setup Required:</strong> Configure Supabase and OAuth credentials to enable authentication.
            See README.md for instructions.
          </p>
        </div>
      </main>
    </div>
  );
}
