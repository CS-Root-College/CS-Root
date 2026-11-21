import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Code2,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

type DsaSubmission = {
  _id: string;
  status: string;
  verdict: boolean;
  createdAt: string;
  problemId?: {
    title?: string;
    difficulty?: string;
    slug?: string;
  } | null;
};

type ActivityDay = {
  date: Date;
  count: number;
};

const subjects = [
  { name: "DSA", detail: "Data Structures & Algorithms", href: "/tutorials/dsa", icon: Code2, color: "#8b85ff" },
  { name: "OOPs", detail: "Object-Oriented Programming", href: "/tutorials/oops", icon: CircleDashed, color: "#f2a969" },
  { name: "DBMS", detail: "Database Management", href: "/tutorials/dbms", icon: Target, color: "#42c7a0" },
  { name: "Computer Networks", detail: "Computer Networks", href: "/tutorials/computer-networks", icon: Zap, color: "#71a9ff" },
  { name: "Operating Systems", detail: "Operating Systems", href: "/tutorials/operating-systems", icon: BookOpen, color: "#79c4e8" },
];

const heatColors = ["#202127", "#17392f", "#146c4d", "#1d9a66", "#34d399"];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const shortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(date);
};

const getHeatLevel = (count: number) => {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

export function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [submissions, setSubmissions] = useState<DsaSubmission[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadRecentSubmissions = async () => {
      setIsLoadingActivity(true);
      setActivityError(false);

      try {
        const firstResponse = await api.get("/problems/get-all-dsa-submissions?page=1", {
          withCredentials: true,
        });
        const firstPage = firstResponse.data?.data;
        const pageCount = Math.min(
          Math.max(Number(firstPage?.pagination?.total) || 1, 1),
          8,
        );

        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            api.get(`/problems/get-all-dsa-submissions?page=${index + 2}`, {
              withCredentials: true,
            }),
          ),
        );

        const pages = [firstResponse, ...remainingPages];
        const items = pages.flatMap((response) =>
          Array.isArray(response.data?.data?.submissions)
            ? response.data.data.submissions as DsaSubmission[]
            : [],
        );
        const uniqueItems = Array.from(
          new Map(items.map((item) => [item._id, item])).values(),
        );

        if (active) setSubmissions(uniqueItems);
      } catch {
        if (active) setActivityError(true);
      } finally {
        if (active) setIsLoadingActivity(false);
      }
    };

    void loadRecentSubmissions();
    return () => { active = false; };
  }, [user]);

  const activityDays = useMemo<ActivityDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 363);

    const counts = new Map<string, number>();
    for (const submission of submissions) {
      const date = new Date(submission.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      date.setHours(0, 0, 0, 0);
      if (date < start || date > today) continue;
      const key = date.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: 364 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, count: counts.get(date.toISOString().slice(0, 10)) ?? 0 };
    });
  }, [submissions]);

  const activityWeeks = useMemo(() => {
    const weeks: ActivityDay[][] = [];
    for (let index = 0; index < activityDays.length; index += 7) {
      weeks.push(activityDays.slice(index, index + 7));
    }
    return weeks;
  }, [activityDays]);

  const monthLabels = useMemo(() => {
    const labels: { name: string; week: number }[] = [];
    let previousMonth = -1;
    activityWeeks.forEach((week, index) => {
      const month = week[0]?.date.getMonth();
      if (month !== undefined && month !== previousMonth) {
        labels.push({
          name: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(week[0].date),
          week: index,
        });
        previousMonth = month;
      }
    });
    return labels;
  }, [activityWeeks]);

  const daysActive = useMemo(
    () => activityDays.filter((day) => day.count > 0).length,
    [activityDays],
  );

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#08090b] px-4 py-12">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-zinc-900" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl bg-zinc-900" />)}</div>
          <div className="h-72 rounded-3xl bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const totalPoints = user.totalPoints ?? 0;
  const experience = user.experiencePoints ?? 0;
  const level = Math.floor(experience / 1000) + 1;
  const levelProgress = experience % 1000;
  const stats = [
    { label: "Points earned", value: totalPoints.toLocaleString("en-IN"), note: "Your total CS ROOT points", icon: Trophy, color: "text-emerald-300", tone: "bg-emerald-400/10 text-emerald-300" },
    { label: "Current streak", value: `${user.streaks ?? 0}`, suffix: "days", note: "Keep the daily rhythm", icon: Flame, color: "text-orange-300", tone: "bg-orange-400/10 text-orange-300" },
    { label: "Experience", value: experience.toLocaleString("en-IN"), note: `Level ${level} · ${levelProgress}/1,000 XP`, icon: Sparkles, color: "text-cyan-300", tone: "bg-cyan-400/10 text-cyan-300" },
    { label: "Badges earned", value: `${user.badgesCount ?? 0}`, note: "Milestones you’ve unlocked", icon: Award, color: "text-violet-300", tone: "bg-violet-400/10 text-violet-300" },
  ];

  const easing = [0.22, 1, 0.36, 1] as const;
  const intro = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#08090b] text-white">
      <div className="pointer-events-none absolute -top-44 left-[12%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.08] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[28rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/[0.08] blur-[130px]" />

      <main className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <motion.section
          {...intro}
          transition={{ duration: 0.58, ease: easing }}
          className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-[#111715] via-[#0d1111] to-[#11111a] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] sm:p-9"
        >
          <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border border-emerald-300/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-emerald-300/[0.06]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" />
                Your learning space
              </div>
              <h1 className="font-['Space_Grotesk',sans-serif] text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.75rem]">
                {getGreeting()}, {user.name || user.username}
                <span className="ml-2 inline-block text-emerald-300">✳</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Your effort adds up. Here’s a look at your CS ROOT points, streak and recent practice.
              </p>
            </div>
            <Link
              to="/practice/dsa"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00e88b] to-[#62e6c0] px-5 text-sm font-bold text-[#04120c] shadow-[0_10px_28px_rgba(0,232,139,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,232,139,0.27)]"
            >
              <Code2 size={16} /> Continue practicing
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-5 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-emerald-300/80" /> Member since {user.createdAt ? shortDate(user.createdAt) : "recently"}</span>
            {user.githubUsername && <span className="inline-flex items-center gap-2"><ArrowUpRight size={14} className="text-zinc-500" /> GitHub: @{user.githubUsername}</span>}
            <Link to="/profile" className="ml-auto inline-flex items-center gap-1.5 text-zinc-300 transition hover:text-emerald-200">View profile <ArrowRight size={13} /></Link>
          </div>
        </motion.section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Your learning stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.article
                key={stat.label}
                {...intro}
                transition={{ duration: 0.48, delay: 0.08 + index * 0.07, ease: easing }}
                whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.18 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101115]/90 p-4 shadow-[0_14px_42px_rgba(0,0,0,0.16)] transition-colors hover:border-white/[0.15] sm:p-5"
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                <div className="flex items-start justify-between gap-2">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}><Icon size={18} /></span>
                  {index === 0 && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300"><ArrowUpRight size={13} /> total</span>}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className={`font-['Space_Grotesk',sans-serif] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2rem] ${stat.color}`}>{stat.value}</span>
                  {stat.suffix && <span className="text-xs font-medium text-zinc-500">{stat.suffix}</span>}
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-300">{stat.label}</p>
                <p className="mt-2 text-[10px] text-zinc-600 sm:text-[11px]">{stat.note}</p>
              </motion.article>
            );
          })}
        </section>

        <motion.section
          {...intro}
          transition={{ duration: 0.55, delay: 0.35, ease: easing }}
          className="mb-6 rounded-3xl border border-white/[0.08] bg-[#101115]/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.16)] sm:p-7"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><CalendarDays size={16} /></span><h2 className="font-['Space_Grotesk',sans-serif] text-base font-semibold text-white">Practice activity</h2></div>
              <p className="mt-2 text-xs text-zinc-500">A year view of the DSA submissions currently available in your account.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {isLoadingActivity ? "Syncing submissions" : `${daysActive} active ${daysActive === 1 ? "day" : "days"}`}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
            <div className="min-w-[720px]">
              <div className="relative mb-2 ml-8 h-4 text-[9px] text-zinc-600">
                {monthLabels.map((month) => <span key={`${month.name}-${month.week}`} className="absolute" style={{ left: `${(month.week / activityWeeks.length) * 100}%` }}>{month.name}</span>)}
              </div>
              <div className="flex gap-2.5">
                <div className="flex w-5 shrink-0 flex-col justify-between py-1 text-[8px] text-zinc-600"><span>Mon</span><span>Wed</span><span>Fri</span></div>
                <div className="flex flex-1 justify-between gap-[3px]">
                  {activityWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                      {week.map((day) => {
                        const level = getHeatLevel(day.count);
                        return (
                          <motion.span
                            key={day.date.toISOString()}
                            title={`${day.count} ${day.count === 1 ? "submission" : "submissions"} · ${day.date.toLocaleDateString()}`}
                            initial={reduceMotion ? false : { opacity: 0, scale: 0.65 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.16, delay: reduceMotion ? 0 : weekIndex * 0.003 }}
                            whileHover={reduceMotion ? undefined : { scale: 1.5, transition: { duration: 0.12 } }}
                            className="h-[10px] w-[10px] rounded-[3px] ring-1 ring-inset ring-white/[0.035] sm:h-[11px] sm:w-[11px]"
                            style={{ backgroundColor: heatColors[level] }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-[10px] text-zinc-600">
            <span>{isLoadingActivity ? "Loading recent practice history…" : activityError ? "Practice history could not be loaded." : submissions.length ? `${submissions.length} recent submissions loaded` : "No DSA submissions yet — your first one will show up here."}</span>
            <span className="inline-flex items-center gap-1.5">Less {heatColors.map((color, index) => <i key={color} className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} title={`Activity level ${index}`} />)} More</span>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <motion.section
            {...intro}
            transition={{ duration: 0.5, delay: 0.42, ease: easing }}
            className="rounded-3xl border border-white/[0.08] bg-[#101115]/90 p-5 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="font-['Space_Grotesk',sans-serif] text-base font-semibold text-white">Recent DSA practice</h2><p className="mt-1 text-xs text-zinc-500">Your latest problem submissions</p></div>
              <Link to="/submissions" className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 transition hover:text-emerald-200">All submissions <ArrowRight size={13} /></Link>
            </div>

            <div className="mt-5 divide-y divide-white/[0.055]">
              <AnimatePresence initial={false}>
                {submissions.slice(0, 5).map((submission, index) => (
                  <motion.div
                    key={submission._id}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, delay: reduceMotion ? 0 : index * 0.035 }}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${submission.verdict ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                      {submission.verdict ? <CheckCircle2 size={16} /> : <Code2 size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">{submission.problemId?.title || "DSA problem"}</p>
                      <p className="mt-1 text-[10px] text-zinc-600">{shortDate(submission.createdAt)} <span className="px-1">·</span> {submission.problemId?.difficulty || "Practice"}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold capitalize ${submission.verdict ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300" : "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"}`}>
                      {submission.verdict ? "Accepted" : submission.status.replaceAll("_", " ")}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isLoadingActivity && submissions.length === 0 && (
                <div className="py-8 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04] text-zinc-500"><Code2 size={19} /></span>
                  <p className="mt-3 text-sm font-medium text-zinc-300">Your first submission starts the story</p>
                  <p className="mt-1 text-xs text-zinc-600">Try a DSA problem and your activity will appear here.</p>
                  <Link to="/practice/dsa" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Browse problems <ArrowRight size={13} /></Link>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            {...intro}
            transition={{ duration: 0.5, delay: 0.5, ease: easing }}
            className="rounded-3xl border border-white/[0.08] bg-[#101115]/90 p-5 sm:p-7"
          >
            <div className="flex items-center justify-between"><div><h2 className="font-['Space_Grotesk',sans-serif] text-base font-semibold text-white">Explore your subjects</h2><p className="mt-1 text-xs text-zinc-500">Choose a track and keep building</p></div><BookOpen size={17} className="text-zinc-600" /></div>
            <div className="mt-4 space-y-1">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <motion.div key={subject.name} whileHover={reduceMotion ? undefined : { x: 3 }}>
                    <Link to={subject.href} className="group flex items-center gap-3 rounded-xl px-2.5 py-3 transition hover:bg-white/[0.035]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ color: subject.color, backgroundColor: `${subject.color}16` }}><Icon size={16} /></span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-zinc-200">{subject.name}</span><span className="mt-0.5 block truncate text-[10px] text-zinc-600">{subject.detail}</span></span>
                      <ArrowRight size={14} className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><Flame size={16} /></span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-zinc-200">Small steps, steady streak</p><p className="mt-1 text-[10px] text-zinc-500">You’re on a {user.streaks ?? 0}-day learning streak.</p></div>
              <Link to="/roadmap" aria-label="Open roadmap" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"><ArrowUpRight size={15} /></Link>
            </div>
          </motion.section>
        </div>

        <motion.footer {...intro} transition={{ duration: 0.4, delay: 0.58 }} className="mt-8 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-zinc-600">
          <span>CS ROOT <span className="px-1.5 text-zinc-800">·</span> Learn. Practice. Improve.</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-300/70" /> One session at a time.</span>
        </motion.footer>
      </main>
    </div>
  );
}