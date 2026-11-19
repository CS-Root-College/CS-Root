import { Link } from "react-router-dom";

const learnLinks = [
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
    label: "Operating System",
    path: "/tutorials/operating-systems",
  },
];

const practiceLinks = [
  {
    label: "Problems",
    path: "/practice",
  },
  {
    label: "MCQs",
    path: "/practice/mcq",
  },
  {
    label: "Quizzes",
    path: "/practice/quiz",
  },
  {
    label: "Practice Dashboard",
    path: "/practice",
  },
];

const platformLinks = [
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Roadmap",
    path: "/roadmap",
  },
  {
    label: "Contact",
    path: "/contact",
  },
  {
    label: "Report a Problem",
    path: "/report",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111522]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tight text-white transition hover:text-[#04AA6D]"
            >
              CS ROOT
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              A Computer Science learning and practice platform built to help
              students learn, practice and improve.
            </p>

            <div className="mt-6 h-1 w-10 rounded-full bg-[#04AA6D]" />
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Learn
            </h3>

            <div className="mt-5 space-y-3">
              {learnLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block w-fit text-sm text-zinc-500 transition hover:translate-x-0.5 hover:text-[#04AA6D]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Practice
            </h3>

            <div className="mt-5 space-y-3">
              {practiceLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="block w-fit text-sm text-zinc-500 transition hover:translate-x-0.5 hover:text-[#04AA6D]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              CS ROOT
            </h3>

            <div className="mt-5 space-y-3">
              {platformLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block w-fit text-sm text-zinc-500 transition hover:translate-x-0.5 hover:text-[#04AA6D]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 sm:mt-12 sm:pt-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-600 sm:text-sm">
              © {new Date().getFullYear()} CS ROOT. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/privacy"
                className="text-xs text-zinc-600 transition hover:text-white sm:text-sm"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="text-xs text-zinc-600 transition hover:text-white sm:text-sm"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}