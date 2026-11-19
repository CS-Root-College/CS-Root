import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Search,
} from "lucide-react";
import { Footer } from "./Footer";
import { SubNavbar } from "../components/SubNabvar";

const subjects = [
  {
    name: "DSA",
    title: "Data Structure and Algorithm",
    description:
      "Learn how to organize and process data efficiently and build strong problem-solving skills.",
    topics: "Arrays • Linked Lists • Stacks • Queues • Trees • Graphs",
    learnPath: "/tutorials/dsa",
    practicePath: "/practice/dsa",
    background: "bg-[#f5ead8]",
    titleColor: "text-[#E87500]",
    buttonColor: "bg-[#E87500] hover:bg-[#c96200]",
    borderColor: "border-[#E87500]",
    hoverBackground: "hover:bg-[#E87500]",
    hoverText: "hover:text-white",
    code: `int arr[] = {10, 20, 30, 40, 50};

for(int i = 0; i < 5; i++)
{
    printf("%d ", arr[i]);
}`,
  },
  {
    name: "OOPs",
    title: "Object-Oriented Programming",
    description:
      "Understand classes, objects, inheritance, polymorphism, abstraction and encapsulation.",
    topics:
      "Classes • Objects • Inheritance • Polymorphism • Abstraction • Encapsulation",
    learnPath: "/tutorials/oops",
    practicePath: "/practice/oops",
    background: "bg-[#e8e1f5]",
    titleColor: "text-[#7654b8]",
    buttonColor: "bg-[#7654b8] hover:bg-[#60429a]",
    borderColor: "border-[#7654b8]",
    hoverBackground: "hover:bg-[#7654b8]",
    hoverText: "hover:text-white",
    code: `class Student {
public:
    string name;

    void display() {
        cout << name;
    }
};`,
  },
  {
    name: "DBMS",
    title: "Database Management System",
    description:
      "Learn databases, SQL, normalization, transactions and the fundamentals of data management.",
    topics:
      "SQL • ER Model • Normalization • Transactions • Indexing • Relational Model",
    learnPath: "/tutorials/dbms",
    practicePath: "/practice/dbms",
    background: "bg-[#dcefe5]",
    titleColor: "text-[#16804f]",
    buttonColor: "bg-[#16804f] hover:bg-[#10643d]",
    borderColor: "border-[#16804f]",
    hoverBackground: "hover:bg-[#16804f]",
    hoverText: "hover:text-white",
    code: `SELECT name, email
FROM students
WHERE department = 'CSE'
ORDER BY name;`,
  },
  {
    name: "CN",
    title: "Computer Networks",
    description:
      "Understand communication systems, protocols, networking models, addressing and routing.",
    topics:
      "OSI Model • TCP/IP • IP Addressing • Routing • Protocols • Network Security",
    learnPath: "/tutorials/computer-networks",
    practicePath: "/practice/computer-networks",
    background: "bg-[#dcebf5]",
    titleColor: "text-[#26739d]",
    buttonColor: "bg-[#26739d] hover:bg-[#1d5a7b]",
    borderColor: "border-[#26739d]",
    hoverBackground: "hover:bg-[#26739d]",
    hoverText: "hover:text-white",
    code: `Client
   |
   | HTTP Request
   v
Server
   |
   | HTTP Response
   v
Client`,
  },
  {
    name: "OS",
    title: "Operating System",
    description:
      "Study processes, memory management, scheduling, file systems and operating system fundamentals.",
    topics:
      "Processes • Threads • Scheduling • Memory • File Systems • Synchronization",
    learnPath: "/tutorials/operating-systems",
    practicePath: "/practice/operating-systems",
    background: "bg-[#e8e5d8]",
    titleColor: "text-[#756c35]",
    buttonColor: "bg-[#756c35] hover:bg-[#5d562b]",
    borderColor: "border-[#756c35]",
    hoverBackground: "hover:bg-[#756c35]",
    hoverText: "hover:text-white",
    code: `Process P1
    |
    v
CPU Scheduler
    |
    +----> P2
    |
    +----> P3`,
  },
];

const quickSubjects = [
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
    label: "OS",
    path: "/tutorials/operating-systems",
  },
  {
    label: "CN",
    path: "/tutorials/computer-networks",
  },
];

const platformFeatures = [
  {
    number: "01",
    title: "Structured Learning",
    description:
      "Follow organized tutorials designed around the core concepts of each subject.",
  },
  {
    number: "02",
    title: "Real Practice",
    description:
      "Solve problems and apply concepts instead of only reading theoretical material.",
  },
  {
    number: "03",
    title: "Multiple Submissions",
    description:
      "Submit code, text, images and other supported answers depending on the problem.",
  },
  {
    number: "04",
    title: "Trusted Evaluation",
    description:
      "Solutions can be evaluated by automated systems, AI or trusted human reviewers.",
  },
];

export function Home() {
  const [search, setSearch] = useState("");

  const filteredSubjects = quickSubjects.filter((subject) =>
    subject.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SubNavbar />
    <div className="min-h-screen overflow-x-hidden bg-[#282A35] text-white">
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#738AFF]/5 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#04AA6D]/5 blur-3xl sm:h-96 sm:w-96" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#04AA6D] sm:text-sm sm:tracking-[0.2em]">
                Computer Science Learning Platform
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:mt-5 sm:text-6xl lg:text-[4.5rem]">
                Welcome to
                <span className="block text-[#738AFF]">
                  CS ROOT
                </span>
              </h1>

              <h2 className="mt-5 text-xl font-semibold leading-snug sm:mt-6 sm:text-3xl">
                Learn Computer Science the Smart Way
              </h2>

              <h3 className="mt-4 text-base font-bold leading-6 text-[#70bb07] sm:mt-5 sm:text-xl">
                Learn • Practice • Improve • Build Your Future
              </h3>

              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-300 sm:mt-6 sm:text-lg sm:leading-7">
                Build your Computer Science foundation through structured
                tutorials, practical problems, quizzes, coding challenges and
                continuous evaluation.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                <Link
                  to="/roadmap"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#738AFF] px-7 text-sm font-bold text-white transition hover:bg-[#5b71d9] sm:w-auto"
                >
                  Start Learning
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/practice"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#04AA6D] px-7 text-sm font-bold text-[#04AA6D] transition hover:bg-[#04AA6D] hover:text-white sm:w-auto"
                >
                  Practice Problems
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 border-y border-zinc-800 py-5 sm:mt-9 sm:max-w-xl">
                <div className="pr-3">
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    05
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">
                    Core Subjects
                  </p>
                </div>

                <div className="border-l border-zinc-800 px-3 sm:pl-5">
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    01
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">
                    Learning Platform
                  </p>
                </div>

                <div className="border-l border-zinc-800 pl-3 sm:pl-5">
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    ∞
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">
                    Ways to Improve
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-2xl border border-zinc-700 bg-[#1d1f27] p-4 shadow-2xl shadow-black/30 sm:rounded-3xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold sm:text-lg">
                      Explore CS ROOT
                    </p>

                    <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                      Find something to learn today
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-semibold text-zinc-500 sm:px-3 sm:text-xs">
                    5 Subjects
                  </span>
                </div>

                <div className="relative mt-5 sm:mt-6">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="What do you want to learn today..."
                    className="h-12 w-full rounded-full border border-zinc-700 bg-[#282A35] pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-[#04AA6D] sm:h-14 sm:pl-12 sm:pr-5 sm:text-sm"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5 xs:grid-cols-2 sm:mt-5 sm:gap-3">
                  {filteredSubjects.map((subject) => (
                    <Link
                      key={subject.path}
                      to={subject.path}
                      className="group rounded-xl border border-zinc-800 bg-[#282A35] p-3.5 transition hover:border-[#04AA6D] sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-300 transition group-hover:text-white sm:text-sm">
                          {subject.label}
                        </span>

                        <ChevronRight
                          size={15}
                          className="shrink-0 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-[#04AA6D]"
                        />
                      </div>

                      <div className="mt-2.5 h-1 w-7 rounded-full bg-zinc-800 transition-all group-hover:w-11 group-hover:bg-[#04AA6D] sm:mt-3 sm:w-8" />
                    </Link>
                  ))}
                </div>

                {filteredSubjects.length === 0 && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-[#282A35] p-5 text-center sm:mt-5 sm:p-6">
                    <p className="text-xs text-zinc-500 sm:text-sm">
                      No subject found.
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-zinc-800 bg-[#282A35] p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 sm:text-xs">
                        Start here
                      </p>

                      <p className="mt-1.5 text-xs font-semibold text-zinc-200 sm:mt-2 sm:text-sm">
                        Follow the CS Root roadmap
                      </p>
                    </div>

                    <Link
                      to="/roadmap"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#04AA6D] text-white transition hover:bg-[#038c5a] sm:h-10 sm:w-10"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800 bg-[#111522]">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-6 lg:px-10">
          <div className="flex min-w-max items-center justify-start gap-7 py-4 sm:justify-center sm:gap-10 sm:py-5">
            {quickSubjects.map((subject) => (
              <Link
                key={subject.path}
                to={subject.path}
                className="text-xs font-bold text-zinc-400 transition hover:text-[#70bb07] sm:text-sm"
              >
                {subject.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5ead8] text-black">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-9 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
            <div>
              <p className="text-6xl font-bold tracking-tight sm:text-7xl">
                DSA
              </p>

              <h2 className="mt-2 text-lg font-bold text-[#E87500] sm:text-xl">
                Data Structure and Algorithm
              </h2>

              <div className="mt-3 h-1 w-32 bg-[#E87500] sm:w-52" />

              <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-zinc-800 sm:mt-7 sm:text-lg sm:leading-8">
                Learn how to organize and process data efficiently and build
                strong problem-solving skills.
              </p>

              <p className="mt-4 text-sm font-semibold leading-6 text-zinc-700 sm:mt-5">
                Arrays • Linked Lists • Stacks • Queues • Trees • Graphs
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <Link
                  to="/tutorials/dsa"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#E87500] px-8 text-sm font-bold text-white transition hover:bg-[#c96200] sm:w-auto"
                >
                  Learn DSA
                </Link>

                <Link
                  to="/practice/dsa"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-[#E87500] bg-white px-8 text-sm font-bold text-[#E87500] transition hover:bg-[#E87500] hover:text-white sm:w-auto"
                >
                  Practice Problems
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-[#e5e7eb] p-4 shadow-xl shadow-black/10 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">
                  Array Example
                </h3>

                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-500 sm:px-3 sm:text-xs">
                  C
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border-l-[4px] border-[#E87500] bg-white sm:mt-4 sm:border-l-[5px]">
                <pre className="overflow-x-auto p-4 text-xs leading-6 text-zinc-800 sm:p-5 sm:text-sm sm:leading-7">
                  <code>{subjects[0].code}</code>
                </pre>
              </div>

              <Link
                to="/practice/dsa"
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-[#E87500] text-sm font-bold text-white transition hover:bg-[#c96200] sm:mt-5 sm:h-12"
              >
                Try it Yourself
              </Link>
            </div>
          </div>
        </div>
      </section>

      {subjects.slice(1).map((subject, index) => (
        <section
          key={subject.name}
          className={subject.background}
        >
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div
              className={`grid items-center gap-9 lg:grid-cols-2 lg:gap-12 ${
                index % 2 !== 0
                  ? "lg:[&>*:first-child]:order-2"
                  : ""
              }`}
            >
              <div>
                <p className="text-6xl font-bold tracking-tight sm:text-7xl">
                  {subject.name}
                </p>

                <h2
                  className={`mt-2 text-lg font-bold sm:text-xl ${subject.titleColor}`}
                >
                  {subject.title}
                </h2>

                <div
                  className={`mt-3 h-1 w-32 sm:w-52 ${subject.buttonColor.split(" ")[0]}`}
                />

                <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-zinc-800 sm:mt-7 sm:text-lg sm:leading-8">
                  {subject.description}
                </p>

                <p className="mt-4 text-sm font-semibold leading-6 text-zinc-700 sm:mt-5">
                  {subject.topics}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                  <Link
                    to={subject.learnPath}
                    className={`inline-flex h-12 w-full items-center justify-center rounded-full px-8 text-sm font-bold text-white transition sm:w-auto ${subject.buttonColor}`}
                  >
                    Learn {subject.name}
                  </Link>

                  <Link
                    to={subject.practicePath}
                    className={`inline-flex h-12 w-full items-center justify-center rounded-full border-2 bg-white px-8 text-sm font-bold transition sm:w-auto ${subject.borderColor} ${subject.titleColor} ${subject.hoverBackground} ${subject.hoverText}`}
                  >
                    Practice
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-4 shadow-xl shadow-black/10 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">
                    Example
                  </h3>

                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-500 sm:px-3 sm:text-xs">
                    Concept
                  </span>
                </div>

                <div
                  className={`mt-3 overflow-hidden rounded-lg border-l-[4px] bg-white sm:mt-4 sm:border-l-[5px] ${subject.borderColor}`}
                >
                  <pre className="min-h-40 overflow-x-auto p-4 text-xs leading-6 text-zinc-800 sm:min-h-48 sm:p-5 sm:text-sm sm:leading-7">
                    <code>{subject.code}</code>
                  </pre>
                </div>

                <Link
                  to={subject.practicePath}
                  className={`mt-4 flex h-11 w-full items-center justify-center rounded-full text-sm font-bold text-white transition sm:mt-5 sm:h-12 ${subject.buttonColor}`}
                >
                  Explore {subject.name}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-y border-zinc-800 bg-[#282A35]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#04AA6D] sm:text-sm sm:tracking-[0.2em]">
                The CS ROOT Experience
              </p>

              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
                Everything you need to actually learn Computer Science.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:mt-5 sm:text-base sm:leading-7">
                CS Root connects learning, practice, submission and evaluation
                into one complete experience.
              </p>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#04AA6D] hover:text-[#05d086]"
            >
              Learn about CS ROOT
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => (
              <div
                key={feature.number}
                className="border border-zinc-800 bg-[#1f212b] p-5 transition hover:border-zinc-700 sm:p-6"
              >
                <p className="text-sm font-bold text-[#04AA6D]">
                  {feature.number}
                </p>

                <h3 className="mt-5 text-base font-bold text-white sm:mt-7 sm:text-lg">
                  {feature.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-zinc-500 sm:text-sm sm:leading-7">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#04AA6D] sm:text-sm sm:tracking-[0.2em]">
            Start Your Journey
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-5xl">
            Build your Computer Science foundation.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500 sm:mt-5 sm:text-base sm:leading-7">
            Learn the concepts. Practice what you learn. Submit your work.
            Keep improving.
          </p>

          <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#04AA6D] px-8 text-sm font-bold text-white transition hover:bg-[#038c5a] sm:w-auto"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/practice"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 sm:w-auto"
            >
              Explore Practice
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}