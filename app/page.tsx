export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-24 px-8 sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl">
            Everything in its place.
          </h1>
          <p className="max-w-xl text-xl leading-relaxed text-zinc-400">
            Streamline your recipe management, meal planning, pantry monitoring,
            and shopping lists in one unified chef&apos;s workstation.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:bg-zinc-200"
            href="/register"
          >
            Get Started
          </a>
          <a
            className="flex h-14 items-center justify-center rounded-full border border-zinc-800 px-8 text-base font-semibold text-white transition-all hover:bg-zinc-900"
            href="https://github.com/Stormray73/mise-en-place"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
