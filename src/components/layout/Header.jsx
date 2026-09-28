import {
  Menu,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

function Header({ onMenuClick }) {
  return (
    <header className="fixed left-[280px] right-0 top-0 z-30 h-[76px] border-b border-gray-200 bg-white">

      <div className="flex h-full items-center justify-between px-7">

        {/* Left */}
        <div className="flex items-center gap-4">

          <button
            onClick={onMenuClick}
            className="hidden rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-[22px] font-bold text-[#075d59]">
              PMS Partner Admin
            </h2>

            <p className="text-xs text-gray-400">
              PixelmindSolutions
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="hidden items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 md:flex">

            <Search
              size={17}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search..."
              className="ml-2 w-36 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />

          </div>

          {/* Notification */}
          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">

            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 rounded-xl bg-[#075d59] px-3 py-2 text-white">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#075d59]">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold">
                Admin
              </p>

              <p className="text-[10px] text-white/60">
                Administrator
              </p>
            </div>

            <ChevronDown size={16} />

          </button>

        </div>

      </div>

    </header>
  );
}

export default Header;