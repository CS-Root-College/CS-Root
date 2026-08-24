import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Search,
} from "lucide-react";
import { Footer } from "./Footer";

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
    <div className="min-h-screen bg-[#282A35] text-white">
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-120px] top-[-120px] h-96 w-96 rounded-full bg-[#738AFF]/5 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-100px] h-96 w-96 rounded-full bg-[#04AA6D]/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#04AA6D]">
                Computer Science Learning Platform
              </p>

              <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]">
                Welcome to
                <span className="block text-[#738AFF]">
                  CS ROOT
                </span>
              </h1>

              <h2 className="mt-6 text-2xl font-semibold sm:text-3xl">
                Learn Computer Science the Smart Way
              </h2>

              <h3 className="mt-5 text-lg font-bold text-[#70bb07] sm:text-xl">
                Learn • Practice • Improve • Build Your Future
              </h3>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
                Build your Computer Science foundation through structured
                tutorials, practical problems, quizzes, coding challenges and
                continuous evaluation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/roadmap"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#738AFF] px-7 text-sm font-bold text-white transition hover:bg-[#5b71d9]"
                >
                  Start Learning
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/practice"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#04AA6D] px-7 text-sm font-bold text-[#04AA6D] transition hover:bg-[#04AA6D] hover:text-white"
                >
                  Practice Problems
                </Link>
              </div>

              <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-zinc-800 py-5">
                <div>
                  <p className="text-2xl font-bold text-white">
                    05
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Core Subjects
                  </p>
                </div>

                <div className="border-l border-zinc-800 pl-5">
                  <p className="text-2xl font-bold text-white">
                    01
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Learning Platform
                  </p>
                </div>

                <div className="border-l border-zinc-800 pl-5">
                  <p className="text-2xl font-bold text-white">
                    ∞
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Ways to Improve
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-zinc-700 bg-[#1d1f27] p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      Explore CS ROOT
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Find something to learn today
                    </p>
                  </div>

                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-500">
                    5 Subjects
                  </span>
                </div>

                <div className="relative mt-6">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="What do you want to learn today..."
                    className="h-14 w-full rounded-full border border-zinc-700 bg-[#282A35] pl-12 pr-5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#04AA6D]"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {filteredSubjects.map((subject) => (
                    <Link
                      key={subject.path}
                      to={subject.path}
                      className="group rounded-xl border border-zinc-800 bg-[#282A35] p-4 transition hover:border-[#04AA6D]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-300 transition group-hover:text-white">
                          {subject.label}
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-[#04AA6D]"
                        />
                      </div>

                      <div className="mt-3 h-1 w-8 rounded-full bg-zinc-800 transition-all group-hover:w-12 group-hover:bg-[#04AA6D]" />
                    </Link>
                  ))}
                </div>

                {filteredSubjects.length === 0 && (
                  <div className="mt-5 rounded-xl border border-zinc-800 bg-[#282A35] p-6 text-center">
                    <p className="text-sm text-zinc-500">
                      No subject found.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#282A35] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Start here
                      </p>

                      <p className="mt-2 font-semibold text-zinc-200">
                        Follow the CS Root roadmap
                      </p>
                    </div>

                    <Link
                      to="/roadmap"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#04AA6D] text-white transition hover:bg-[#038c5a]"
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800 bg-[#111522]">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-10">
          <div className="flex min-w-max items-center justify-center gap-10 py-5">
            {quickSubjects.map((subject) => (
              <Link
                key={subject.path}
                to={subject.path}
                className="text-sm font-bold text-zinc-400 transition hover:text-[#70bb07]"
              >
                {subject.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5ead8] text-black">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-7xl font-bold tracking-tight">
                DSA
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#E87500]">
                Data Structure and Algorithm
              </h2>

              <div className="mt-3 h-1 w-52 bg-[#E87500]" />

              <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-zinc-800">
                Learn how to organize and process data efficiently and build
                strong problem-solving skills.
              </p>

              <p className="mt-5 font-semibold text-zinc-700">
                Arrays • Linked Lists • Stacks • Queues • Trees • Graphs
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/tutorials/dsa"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#E87500] px-8 text-sm font-bold text-white transition hover:bg-[#c96200]"
                >
                  Learn DSA
                </Link>

                <Link
                  to="/practice/dsa"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#E87500] bg-white px-8 text-sm font-bold text-[#E87500] transition hover:bg-[#E87500] hover:text-white"
                >
                  Practice Problems
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-[#e5e7eb] p-5 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">
                  Array Example
                </h3>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500">
                  C
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border-l-[5px] border-[#E87500] bg-white">
                <pre className="overflow-x-auto p-5 text-sm leading-7 text-zinc-800">
                  <code>{subjects[0].code}</code>
                </pre>
              </div>

              <Link
                to="/practice/dsa"
                className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#E87500] text-sm font-bold text-white transition hover:bg-[#c96200]"
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
          className={`${subject.background}`}
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                index % 2 !== 0
                  ? "lg:[&>*:first-child]:order-2"
                  : ""
              }`}
            >
              <div>
                <p className="text-7xl font-bold tracking-tight">
                  {subject.name}
                </p>

                <h2
                  className={`mt-2 text-xl font-bold ${subject.titleColor}`}
                >
                  {subject.title}
                </h2>

                <div
                  className={`mt-3 h-1 w-52 ${subject.buttonColor.split(" ")[0]}`}
                />

                <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-zinc-800">
                  {subject.description}
                </p>

                <p className="mt-5 font-semibold text-zinc-700">
                  {subject.topics}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={subject.learnPath}
                    className={`inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold text-white transition ${subject.buttonColor}`}
                  >
                    Learn {subject.name}
                  </Link>

                  <Link
                    to={subject.practicePath}
                    className={`inline-flex h-12 items-center justify-center rounded-full border-2 bg-white px-8 text-sm font-bold transition ${subject.borderColor} ${subject.titleColor} ${subject.hoverBackground} ${subject.hoverText}`}
                  >
                    Practice
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-5 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900">
                    Example
                  </h3>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500">
                    Concept
                  </span>
                </div>

                <div
                  className={`mt-4 overflow-hidden rounded-lg border-l-[5px] bg-white ${subject.borderColor}`}
                >
                  <pre className="min-h-48 overflow-x-auto p-5 text-sm leading-7 text-zinc-800">
                    <code>{subject.code}</code>
                  </pre>
                </div>

                <Link
                  to={subject.practicePath}
                  className={`mt-5 flex h-12 items-center justify-center rounded-full text-sm font-bold text-white transition ${subject.buttonColor}`}
                >
                  Explore {subject.name}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-y border-zinc-800 bg-[#282A35]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#04AA6D]">
                The CS ROOT Experience
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Everything you need to actually learn Computer Science.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
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

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => (
              <div
                key={feature.number}
                className="border border-zinc-800 bg-[#1f212b] p-6 transition hover:border-zinc-700"
              >
                <p className="text-sm font-bold text-[#04AA6D]">
                  {feature.number}
                </p>

                <h3 className="mt-7 text-lg font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#04AA6D]">
            Start Your Journey
          </p>

          <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
            Build your Computer Science foundation.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-500">
            Learn the concepts. Practice what you learn. Submit your work.
            Keep improving.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#04AA6D] px-8 text-sm font-bold text-white transition hover:bg-[#038c5a]"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/practice"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Explore Practice
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}