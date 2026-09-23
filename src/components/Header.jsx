
import {
  Menu,
  Search,
  Bell,
  UserRound,
  RefreshCw,
} from "lucide-react";

function Header({
  searchTerm,
  setSearchTerm,
  setSidebarOpen,
}) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="mb-6">
      {/* Mobile navigation */}
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-cyan-300/15 bg-slate-950/70 p-2.5 shadow-sm"
        >
          <Menu />
        </button>

        <span className="font-bold text-slate-100">
          CDR Analytics
        </span>
      </div>

      {/* Header content */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Welcome message */}
        <div>
          <p className="mb-1 text-sm font-semibold text-fuchsia-300">
            CALL INTELLIGENCE OVERVIEW
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            Welcome back,{" "}
            <span className="gradient-text">
              Admin
            </span>
          </h1>

          <p className="mt-1 text-slate-400">
            Here’s what’s happening with your call data today.
          </p>
        </div>

        {/* Header controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search field */}
          <div className="flex min-w-[280px] flex-1 items-center rounded-xl border border-cyan-300/15 bg-slate-950/55 px-4 py-3 shadow-sm xl:w-80">
            <Search
              size={18}
              className="text-cyan-400"
            />

            <input
              type="search"
              aria-label="Search call records"
              className="ml-2 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Search caller name, number or city..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          {/* Refresh button */}
          <button
            type="button"
            aria-label="Refresh API data"
            title="Refresh API data"
            onClick={handleRefresh}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-slate-950/70 text-cyan-300 shadow-sm hover:bg-cyan-400/10"
          >
            <RefreshCw size={18} />
          </button>

          {/* Notification indicator */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-slate-950/70 text-cyan-300 shadow-sm"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Admin profile */}
          <div className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-slate-950/70 px-3 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white">
              <UserRound size={16} />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-100">
                Admin
              </p>

              <p className="text-[10px] text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;