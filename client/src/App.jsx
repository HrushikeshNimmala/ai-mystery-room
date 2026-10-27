
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Shield,
  Fingerprint,
  Eye,
  Brain,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  FileSearch,
} from "lucide-react";
import api from "./api/axios";

const categories = [
  { name: "General Mystery", icon: Search, description: "Uncover the unexpected" },
  { name: "Murder Mystery", icon: Fingerprint, description: "Follow the evidence" },
  { name: "Art Theft", icon: Eye, description: "Recover the missing masterpiece" },
  { name: "Cyber Crime", icon: Shield, description: "Trace the digital trail" },
  { name: "Missing Person", icon: Search, description: "Find what disappeared" },
  { name: "Museum Heist", icon: FileSearch, description: "Crack the perfect crime" },
];

const difficulties = [
  { name: "easy", label: "Rookie", detail: "3 suspects · 5 clues", color: "emerald" },
  { name: "medium", label: "Detective", detail: "4 suspects · 7 clues", color: "amber" },
  { name: "hard", label: "Mastermind", detail: "5 suspects · 9 clues", color: "red" },
];

export default function App() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("General Mystery");
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startInvestigation() {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/cases", {
        category,
        difficulty,
      });

      const caseData = response.data.case;

      if (!caseData?.id) {
        throw new Error("The server did not return a case ID.");
      }

      navigate(`/case/${caseData.id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to create a mystery. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(180,120,35,0.13),transparent_50%)]" />
      <div className="pointer-events-none absolute left-[-100px] top-64 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-100px] h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <nav className="flex items-center justify-between border-b border-white/10 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <Fingerprint className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="font-bold tracking-wide">AI MYSTERY ROOM</p>
              <p className="text-xs text-slate-500">Every clue tells a story</p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            DETECTIVE SYSTEM ONLINE
          </div>
        </nav>

        <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-4 py-2 text-xs font-medium tracking-wider text-amber-300">
              <Sparkles className="h-4 w-4" />
              YOUR NEXT CASE AWAITS
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Every mystery
              <br />
              has a <span className="text-amber-400">secret.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Enter a world of hidden motives, suspicious alibis, and
              unexplained evidence. Investigate the clues, question the
              suspects, and discover the truth.
            </p>

            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { number: "01", label: "Investigate" },
                { number: "02", label: "Analyze" },
                { number: "03", label: "Accuse" },
              ].map((item) => (
                <div
                  key={item.number}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <p className="text-xs tracking-widest text-amber-400">
                    {item.number}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-[#111621] p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 bg-amber-500/[0.06] blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.25em] text-amber-400">
                    CASE FILE 001
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">The Unknown</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10">
                  <Eye className="h-6 w-6 text-amber-400" />
                </div>
              </div>

              <div className="my-7 flex aspect-[5/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.13),transparent_65%),linear-gradient(145deg,#171d29,#0b0e15)]">
                <div className="text-center">
                  <Fingerprint className="mx-auto h-24 w-24 text-amber-500/60 sm:h-28 sm:w-28" strokeWidth={0.8} />
                  <p className="mt-4 text-xs tracking-[0.35em] text-slate-500">
                    CLASSIFIED EVIDENCE
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Someone is hiding the truth.",
                  "Every suspect has a motive.",
                  "The evidence never lies.",
                ].map((line, index) => (
                  <div key={line} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/20 text-xs text-amber-400">
                      {index + 1}
                    </span>
                    {line}
                  </div>
                ))}
              </div>

              <div className="mt-7 border-t border-white/10 pt-5 text-xs text-slate-500">
                THINK CAREFULLY. ACCUSE WISELY.
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mb-7">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-400">
              MISSION CONTROL
            </p>
            <h2 className="mt-2 text-3xl font-bold">Build your investigation</h2>
            <p className="mt-2 text-sm text-slate-400">
              Choose your case type and select your level of challenge.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-300">
                01 / SELECT CASE CATEGORY
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const selected = category === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => setCategory(item.name)}
                      className={`rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                        selected
                          ? "border-amber-400/70 bg-amber-400/[0.08] shadow-lg shadow-amber-950/20"
                          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          selected ? "bg-amber-400/15 text-amber-300" : "bg-white/5 text-slate-400"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className={`mt-1 h-4 w-4 rounded-full border ${
                          selected ? "border-amber-400 bg-amber-400 shadow-[inset_0_0_0_3px_#111621]" : "border-slate-600"
                        }`} />
                      </div>
                      <p className="mt-4 font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-300">
                02 / SELECT DIFFICULTY
              </h3>

              <div className="space-y-3">
                {difficulties.map((item) => {
                  const selected = difficulty === item.name;
                  const accent =
                    item.name === "easy"
                      ? "emerald"
                      : item.name === "medium"
                      ? "amber"
                      : "red";

                  return (
                    <button
                      key={item.name}
                      onClick={() => setDifficulty(item.name)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-amber-400/60 bg-amber-400/[0.06]"
                          : "border-white/10 bg-white/[0.025] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          accent === "emerald"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : accent === "amber"
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-red-400/10 text-red-400"
                        }`}>
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                        </div>
                      </div>
                      {selected && <CheckMark />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Selected case</span>
                  <span className="font-semibold text-amber-300">{category}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="font-semibold capitalize">{difficulty}</span>
                </div>

                {error && (
                  <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  onClick={startInvestigation}
                  disabled={loading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Preparing your case...
                    </>
                  ) : (
                    <>
                      Start investigation
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Your choices determine your next case.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>AI MYSTERY ROOM · THINK LIKE A DETECTIVE</p>
          <p>Every clue matters. Every decision counts.</p>
        </footer>
      </div>
    </main>
  );
}

function CheckMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-slate-950">
      ✓
    </span>
  );
}
