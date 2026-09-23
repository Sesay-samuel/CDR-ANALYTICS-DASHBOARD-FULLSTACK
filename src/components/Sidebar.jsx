
import {
  LayoutDashboard,
  Phone,
  BarChart3,
  X,
  Activity,
  Sparkles,
} from "lucide-react";

function Sidebar({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
}) {
  // Sidebar navigation items
  const items = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Call Records",
      icon: Phone,
    },
    {
      name: "Analytics",
      icon: BarChart3,
    },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    closeSidebar();
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#07111f]/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-hidden border-r border-cyan-300/10 bg-[#050b16]/95 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Decorative background */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_20%_100%,rgba(6,182,212,.30),transparent_45%),radial-gradient(circle_at_80%_100%,rgba(217,70,239,.28),transparent_48%)] opacity-70" />

        {/* Sidebar header */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-900/30">
              <Activity size={23} />
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                CDR Analytics
              </h1>

              <p className="text-xs text-cyan-200">
                Insights from every call
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            aria-label="Close sidebar"
            className="lg:hidden"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative space-y-2 p-4">
          {items.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleNavigation(name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activePage === name
                  ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-blue-950/30"
                  : "text-indigo-100 hover:bg-white/5"
              }`}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="relative mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-400/15">
              <Sparkles size={18} />
            </div>

            <p className="font-semibold">
              Turn call data into real insights
            </p>

            <p className="mt-2 text-xs leading-5 text-cyan-200">
              Monitor activity, costs and calling patterns in one
              place.
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] text-cyan-300">
            CDR Analytics Dashboard
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;