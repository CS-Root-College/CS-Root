import { memo } from "react";
import { Link, useLocation } from "react-router-dom";

const subjects = [
  {
    label: "DSA",
    path: "/tutorials/dsa",
  },
  {
    label: "OOPs",
    path: "/tutorials/oops",
  },
  {
    label: "DBMS",
    path: "/tutorials/dbms",
  },
  {
    label: "Computer Networks",
    path: "/tutorials/computer-networks",
  },
  {
    label: "Operating Systems",
    path: "/tutorials/operating-systems",
  },
];

export const SubNavbar = memo(() => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sticky top-16 z-40 border-b border-zinc-800 bg-[#111522]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl overflow-x-auto px-3 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex min-w-max items-center justify-start gap-1 py-1.5 sm:justify-center sm:gap-2 sm:py-2">
          {subjects.map((subject) => {
            const active = isActive(subject.path);

            return (
              <Link
                key={subject.path}
                to={subject.path}
                className={`relative whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                }`}
              >
                {subject.label}

                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#04AA6D] sm:w-8" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
});