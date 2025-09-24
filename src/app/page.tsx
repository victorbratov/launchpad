/**
 * Home Screen
*/
export default function Page() {
  return (
    <div className="font-mono grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        <div className="w-full items-center text-4xl">
          <h1>Launchpad</h1>
        </div>
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="flex flex-col gap-[32px] row-start-2 items-center">
          <h1 className="text-center">Welcome to Launchpad</h1>
          <p className="w-1/2 text-center">Launchpad is an investment platform that allows businesses and investors to collaborate openly and effectively. </p>
          <p className="w-1/2 text-center"> Log in to a business account to receive funding from investors. Log in to an investor account to support business ideas and gain from the profits.</p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/sign-in"
            target="_blank"
            rel="noopener noreferrer"
          >
            Log In
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/signup"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign Up
          </a>
        </div>
      </main>
    </div>
  );
}
