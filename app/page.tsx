export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-black text-white">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-24 pb-16 px-8 text-center max-w-6xl mx-auto">
        <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
          The Professional Kitchen OS
        </div>
        <h1 className="text-6xl font-extrabold leading-tight tracking-tighter sm:text-8xl mb-8">
          Everything in{" "}
          <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">
            its place.
          </span>
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-zinc-400 mb-12">
          Streamline your recipe management, meal planning, pantry monitoring,
          and shopping lists in one unified chef&apos;s workstation.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row mb-24">
          <a
            className="flex h-14 items-center justify-center rounded-xl bg-blue-600 px-10 text-lg font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
            href="/login"
          >
            Start Cooking Free
          </a>
          <a
            className="flex h-14 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/50 px-10 text-lg font-bold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white"
            href="#features"
          >
            Explore Features
          </a>
        </div>

        {/* Hero Screenshot Placeholder */}
        <div className="relative w-full aspect-video rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm uppercase tracking-widest">
            [ Dashboard Preview ]
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-8 border-t border-zinc-900 bg-zinc-950/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30 mb-6">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Smart Recipes</h3>
              <p className="text-zinc-400 leading-relaxed">
                Import from URL or create custom recipes with full macro
                tracking and automatic scaling for any yield.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center border border-amber-500/30 mb-6">
                <svg
                  className="w-6 h-6 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Weekly Planner</h3>
              <p className="text-zinc-400 leading-relaxed">
                Drag and drop recipes into your week. Automatically calculate
                cumulative macros and check pantry requirements.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30 mb-6">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Auto Shopping</h3>
              <p className="text-zinc-400 leading-relaxed">
                One-click shopping lists generated from your meal plan, adjusted
                for what&apos;s already in your pantry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-8 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">
            Master your kitchen in 3 steps.
          </h2>
          <div className="space-y-24">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-left">
                <span className="text-blue-500 font-bold text-lg mb-2 block">
                  STEP 01
                </span>
                <h4 className="text-3xl font-bold mb-4">Build your library</h4>
                <p className="text-zinc-400">
                  Scrape recipes from the web or add your family favorites. Our
                  system tracks every gram of protein, fat, and carb
                  automatically.
                </p>
              </div>
              <div className="flex-1 w-full h-48 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-700">
                [ Recipe Import Mock ]
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 text-left">
                <span className="text-amber-500 font-bold text-lg mb-2 block">
                  STEP 02
                </span>
                <h4 className="text-3xl font-bold mb-4">Plan with precision</h4>
                <p className="text-zinc-400">
                  Allocate meals to your calendar. See your total daily
                  nutrition and identify prep tasks ahead of time.
                </p>
              </div>
              <div className="flex-1 w-full h-48 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-700">
                [ Calendar Grid Mock ]
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-left">
                <span className="text-green-500 font-bold text-lg mb-2 block">
                  STEP 03
                </span>
                <h4 className="text-3xl font-bold mb-4">Execute like a pro</h4>
                <p className="text-zinc-400">
                  Interactive cooking mode with step-by-step instructions and
                  built-in timers. Pantry stock is deducted as you cook.
                </p>
              </div>
              <div className="flex-1 w-full h-48 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-700">
                [ Cook Mode Mock ]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-8 border-t border-zinc-900 bg-zinc-950 text-center">
        <h2 className="text-4xl font-bold mb-8 italic">
          &ldquo;Mise-en-place makes me feel like a head chef.&rdquo;
        </h2>
        <p className="text-zinc-500 mb-12">
          — Beta user from the culinary arts
        </p>
        <a
          className="inline-flex h-16 items-center justify-center rounded-xl bg-white px-12 text-xl font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95"
          href="/login"
        >
          Sign Up with Google
        </a>
      </section>

      <footer className="py-12 px-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        &copy; {new Date().getFullYear()} Mise-en-place. Built for the home
        cook.
      </footer>
    </div>
  );
}
