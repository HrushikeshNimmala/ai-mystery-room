
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Lightbulb,
  ShieldAlert,
  UserRound,
  MapPin,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  LoaderCircle,
  FileSearch,
  LockKeyhole,
} from "lucide-react";
import api from "../api/axios";

const getPayload = (response) =>
  response?.data?.case || response?.data || {};

const getId = (item) =>
  item?.suspectId ??
  item?.clueId ??
  item?.id ??
  item?._id ??
  item?.name ??
  item?.title;

const getDifficulty = (value) =>
  String(value || "easy").toLowerCase();

const difficultyLabel = (value) =>
  getDifficulty(value).charAt(0).toUpperCase() +
  getDifficulty(value).slice(1);

const getDiscoveredIds = (data) => {
  if (Array.isArray(data?.discoveredClueIds)) {
    return data.discoveredClueIds;
  }

  return (data?.clues || [])
    .filter((clue) => clue.discovered)
    .map((clue) => clue.clueId);
};

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#11131b] p-5 shadow-xl sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-2.5 text-violet-300">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090a10] px-5 text-white">
      <div className="text-center">
        <LoaderCircle
          size={42}
          className="mx-auto animate-spin text-violet-400"
        />
        <p className="mt-4 text-gray-300">
          Loading your investigation...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry, onHome }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090a10] px-5 text-white">
      <Panel className="w-full max-w-lg text-center">
        <ShieldAlert
          size={42}
          className="mx-auto text-red-400"
        />
        <h1 className="mt-4 text-2xl font-bold">
          Investigation unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <button
            onClick={onHome}
            className="rounded-xl border border-white/10 px-4 py-3 text-gray-200 hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>
      </Panel>
    </div>
  );
}

function ResultScreen({ result, caseData, onHome, onNewCase }) {
  const finalData = result?.case || result || caseData || {};

  const culpritId =
    finalData.culpritSuspectId ?? result?.culpritSuspectId;

  const suspects = finalData.suspects || caseData?.suspects || [];

  const culprit = suspects.find(
    (suspect) => suspect.suspectId === culpritId
  );

  const correct =
    typeof result?.correct === "boolean"
      ? result.correct
      : Boolean(
          culpritId &&
            finalData.accusedSuspectId &&
            culpritId === finalData.accusedSuspectId
        );

  const score =
    finalData.finalScore ?? result?.score ?? 0;

  const discoveredCount = getDiscoveredIds(finalData).length;

  const hintsUsed =
    finalData.hintsUsed ?? caseData?.hintsUsed ?? 0;

  const explanation =
    finalData.solutionExplanation ||
    result?.solutionExplanation ||
    "Review the evidence and compare it with the suspects' statements.";

  const breakdown = result?.scoreBreakdown;

  return (
    <div className="min-h-screen bg-[#090a10] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onHome}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <Panel className="overflow-hidden text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              correct
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {correct ? (
              <Trophy size={38} />
            ) : (
              <XCircle size={38} />
            )}
          </div>

          <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
            Investigation complete
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {correct ? "Case solved!" : "Case closed"}
          </h1>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-400">
            {correct
              ? "Excellent detective work. You identified the correct suspect."
              : "Your accusation was incorrect. Review the evidence and solution below."}
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Final score</p>
              <p className="mt-2 text-3xl font-bold text-violet-300">
                {score}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Clues discovered</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {discoveredCount}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Hints used</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {hintsUsed}
              </p>
            </div>
          </div>
        </Panel>

        {breakdown && (
          <Panel className="mt-5">
            <SectionHeading
              icon={Trophy}
              title="Score breakdown"
              subtitle="How your final score was calculated"
            />

            <div className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-400">Base score</span>
                <span>{breakdown.baseScore}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-400">
                  Clue bonus
                </span>
                <span className="text-emerald-400">
                  +{breakdown.clueBonus}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-400">
                  Hint penalty
                </span>
                <span className="text-red-400">
                  -{breakdown.hintPenalty}
                </span>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between gap-4 font-semibold">
                  <span>Final score</span>
                  <span className="text-violet-300">
                    {breakdown.finalScore}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        <Panel className="mt-5">
          <SectionHeading
            icon={correct ? CheckCircle2 : ShieldAlert}
            title="Mystery solution"
            subtitle="The final explanation of the case"
          />

          <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-5">
            <p className="text-sm text-gray-400">The culprit</p>
            <h2 className="mt-2 text-2xl font-bold text-violet-200">
              {culprit?.name || "Culprit identified in the case report"}
            </h2>

            {culprit?.description && (
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {culprit.description}
              </p>
            )}

            <div className="mt-5 border-t border-white/10 pt-4">
              <h3 className="font-semibold text-white">
                Solution explanation
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-300">
                {explanation}
              </p>
            </div>
          </div>
        </Panel>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onNewCase}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
          >
            <RefreshCw size={17} />
            Create another mystery
          </button>

          <button
            onClick={onHome}
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-200 hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [hintHistory, setHintHistory] = useState([]);
  const [notice, setNotice] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [result, setResult] = useState(null);

  const discoveredIds = useMemo(
    () => getDiscoveredIds(caseData),
    [caseData]
  );

  const discoveredCount = discoveredIds.length;

  const undiscoveredCount = Math.max(
    0,
    (caseData?.clues?.length || 0) - discoveredCount
  );

  const loadCase = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/cases/${id}`);
      const data = getPayload(response);

      setCaseData(data);

      if (data?.isCompleted) {
        // The normal case endpoint hides the solution.
        // Fetch the result endpoint for completed investigations.
        const resultResponse = await api.get(`/cases/${id}/result`);
        setResult(resultResponse.data);
      } else {
        setResult(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this mystery. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const discoverClue = async (clueId) => {
    if (!clueId || busyAction || caseData?.isCompleted) return;

    try {
      setBusyAction(`clue:${clueId}`);
      setNotice("");

      const response = await api.post(
        `/cases/${id}/clues/${clueId}/discover`
      );

      const data = response.data || {};
      const updatedCase = getPayload(response);

      if (updatedCase?.clues) {
        setCaseData(updatedCase);
      } else {
        await loadCase();
      }

      setNotice(data.message || "Clue discovered successfully.");
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          "Unable to discover this clue."
      );
    } finally {
      setBusyAction("");
    }
  };

  const requestHint = async () => {
    if (busyAction || caseData?.isCompleted) return;

    try {
      setBusyAction("hint");
      setNotice("");

      const response = await api.post(`/cases/${id}/hints`);
      const data = response.data || {};

      if (data.hint) {
        setHintHistory((previous) => [
          ...previous,
          {
            id: `${Date.now()}-${previous.length}`,
            text: data.hint,
          },
        ]);
      }

      setNotice(data.message || "Hint received.");

      if (data.case) {
        setCaseData(data.case);
      } else {
        // The hints endpoint returns hint information rather than
        // the whole case, so reload the latest case state.
        const caseResponse = await api.get(`/cases/${id}`);
        setCaseData(getPayload(caseResponse));
      }
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          "Unable to request a hint."
      );
    } finally {
      setBusyAction("");
    }
  };

  const accuseSuspect = async () => {
    if (!selectedSuspect || busyAction || caseData?.isCompleted) {
      if (!selectedSuspect) {
        setNotice("Select a suspect before submitting your accusation.");
      }
      return;
    }

    const suspect = caseData?.suspects?.find(
      (item) => item.suspectId === selectedSuspect
    );

    const confirmed = window.confirm(
      `Are you sure you want to accuse ${suspect?.name || "this suspect"}? You cannot change your accusation after submitting it.`
    );

    if (!confirmed) return;

    try {
      setBusyAction("accuse");
      setNotice("");

      const response = await api.post(`/cases/${id}/accuse`, {
        suspectId: selectedSuspect,
      });

      setResult(response.data);

      if (response.data?.case) {
        setCaseData(response.data.case);
      } else {
        const caseResponse = await api.get(`/cases/${id}`);
        setCaseData(getPayload(caseResponse));
      }
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          "Unable to submit your accusation."
      );
    } finally {
      setBusyAction("");
    }
  };

  const goHome = () => navigate("/");
  const createAnotherCase = () => navigate("/");

  if (loading && !caseData) {
    return <LoadingScreen />;
  }

  if (error && !caseData) {
    return (
      <ErrorScreen
        message={error}
        onRetry={loadCase}
        onHome={goHome}
      />
    );
  }

  if (!caseData) {
    return (
      <ErrorScreen
        message="The requested mystery could not be found."
        onRetry={loadCase}
        onHome={goHome}
      />
    );
  }

  if (caseData.isCompleted) {
    return (
      <ResultScreen
        result={result}
        caseData={caseData}
        onHome={goHome}
        onNewCase={createAnotherCase}
      />
    );
  }

  const clues = caseData.clues || [];
  const suspects = caseData.suspects || [];
  const hintsRemaining = Math.max(
    0,
    (caseData.maxHints || 0) - (caseData.hintsUsed || 0)
  );

  return (
    <div className="min-h-screen bg-[#090a10] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090a10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-violet-300">
              Investigation room
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {difficultyLabel(caseData.difficulty)} difficulty
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
              {caseData.category}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
              {difficultyLabel(caseData.difficulty)}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            {caseData.title || "Mystery Investigation"}
          </h1>

          <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-gray-400 sm:text-base">
            {caseData.story}
          </p>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100"
          >
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#11131b] p-4">
            <p className="text-xs text-gray-400">Base score</p>
            <p className="mt-2 text-2xl font-bold text-violet-300">
              {caseData.baseScore ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#11131b] p-4">
            <p className="text-xs text-gray-400">Clues discovered</p>
            <p className="mt-2 text-2xl font-bold">
              {discoveredCount}
              <span className="ml-1 text-sm font-normal text-gray-500">
                / {clues.length}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#11131b] p-4">
            <p className="text-xs text-gray-400">Hints remaining</p>
            <p className="mt-2 text-2xl font-bold">
              {hintsRemaining}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#11131b] p-4">
            <p className="text-xs text-gray-400">Evidence remaining</p>
            <p className="mt-2 text-2xl font-bold">
              {undiscoveredCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel>
              <SectionHeading
                icon={FileSearch}
                title="Evidence board"
                subtitle="Inspect clues to reveal their details."
                right={
                  <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                    {discoveredCount}/{clues.length}
                  </span>
                }
              />

              {clues.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No clues are available for this case.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {clues.map((clue, index) => {
                    const clueId = getId(clue);
                    const discovered = discoveredIds.includes(clueId);
                    const busy = busyAction === `clue:${clueId}`;

                    return (
                      <article
                        key={clueId || index}
                        className={`rounded-xl border p-4 transition ${
                          discovered
                            ? "border-emerald-400/20 bg-emerald-500/[0.04]"
                            : "border-white/10 bg-white/[0.02] hover:border-violet-400/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                discovered
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-white/5 text-gray-400"
                              }`}
                            >
                              {discovered ? (
                                <Eye size={18} />
                              ) : (
                                <EyeOff size={18} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-white">
                                {clue.title || `Clue ${index + 1}`}
                              </h3>
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} />
                                {clue.location || "Unknown location"}
                              </p>
                            </div>
                          </div>

                          {discovered && (
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-emerald-400"
                            />
                          )}
                        </div>

                        {discovered ? (
                          <div className="mt-4">
                            <p className="whitespace-pre-line text-sm leading-6 text-gray-300">
                              {clue.description ||
                                "No additional description provided."}
                            </p>

                            {Array.isArray(clue.relatedSuspectIds) &&
                              clue.relatedSuspectIds.length > 0 && (
                                <p className="mt-3 text-xs text-violet-300">
                                  Related persons:{" "}
                                  {clue.relatedSuspectIds
                                    .map((relatedId) => {
                                      const person = suspects.find(
                                        (suspect) =>
                                          suspect.suspectId === relatedId
                                      );
                                      return person?.name || relatedId;
                                    })
                                    .join(", ")}
                                </p>
                              )}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-lg border border-dashed border-white/10 p-3">
                            <p className="flex items-center gap-2 text-sm text-gray-500">
                              <LockKeyhole size={15} />
                              Evidence details are hidden.
                            </p>

                            <button
                              disabled={Boolean(busyAction)}
                              onClick={() => discoverClue(clueId)}
                              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busy ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Search size={16} />
                              )}
                              {busy ? "Investigating..." : "Inspect clue"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel>
              <SectionHeading
                icon={UserRound}
                title="Persons of interest"
                subtitle="Compare each suspect's motive, description, and alibi."
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suspects.map((suspect, index) => {
                  const suspectId = getId(suspect);
                  const selected = selectedSuspect === suspectId;

                  return (
                    <button
                      type="button"
                      key={suspectId || index}
                      onClick={() => {
                        setSelectedSuspect(suspectId);
                        setNotice("");
                      }}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-violet-400/60 bg-violet-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white/5 p-2.5 text-gray-300">
                          <UserRound size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white">
                            {suspect.name || `Suspect ${index + 1}`}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {suspect.role || "Person of interest"}
                          </p>
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-violet-300"
                          />
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-gray-300">
                        {suspect.description}
                      </p>

                      <div className="mt-4 border-t border-white/10 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Motive
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">
                          {suspect.motive || "No motive recorded."}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Alibi
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">
                          {suspect.alibi || "No alibi recorded."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel>
              <SectionHeading
                icon={Lightbulb}
                title="Request a hint"
                subtitle="Get a small nudge to help your investigation."
              />

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Hints used</span>
                  <span className="font-semibold text-white">
                    {caseData.hintsUsed || 0} / {caseData.maxHints}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{
                      width: `${
                        caseData.maxHints > 0
                          ? Math.min(
                              100,
                              ((caseData.hintsUsed || 0) /
                                caseData.maxHints) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={
                    Boolean(busyAction) ||
                    hintsRemaining <= 0
                  }
                  onClick={requestHint}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 font-medium text-violet-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busyAction === "hint" ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Lightbulb size={17} />
                  )}
                  {busyAction === "hint"
                    ? "Getting hint..."
                    : hintsRemaining > 0
                      ? "Get a hint (-10 points)"
                      : "No hints remaining"}
                </button>
              </div>

              {hintHistory.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Your hints
                  </h3>

                  {hintHistory.map((hint, index) => (
                    <div
                      key={hint.id}
                      className="rounded-xl border border-amber-400/15 bg-amber-500/[0.04] p-3"
                    >
                      <p className="text-xs font-semibold text-amber-300">
                        Hint {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {hint.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <SectionHeading
                icon={ShieldAlert}
                title="Submit accusation"
                subtitle="Choose carefully. You only get one final accusation."
              />

              <div className="rounded-xl border border-red-400/15 bg-red-500/[0.04] p-4">
                <p className="text-sm leading-6 text-gray-300">
                  Compare the evidence with each suspect's alibi and
                  motive before making your final decision.
                </p>

                <div className="mt-4">
                  <label
                    htmlFor="accused-suspect"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Select the culprit
                  </label>

                  <select
                    id="accused-suspect"
                    value={selectedSuspect}
                    onChange={(event) =>
                      setSelectedSuspect(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-3 text-sm text-white outline-none focus:border-violet-400"
                  >
                    <option value="">Choose a suspect...</option>
                    {suspects.map((suspect, index) => (
                      <option
                        key={getId(suspect) || index}
                        value={suspect.suspectId}
                      >
                        {suspect.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={
                    Boolean(busyAction) || !selectedSuspect
                  }
                  onClick={accuseSuspect}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busyAction === "accuse" ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldAlert size={17} />
                  )}
                  {busyAction === "accuse"
                    ? "Submitting..."
                    : "Accuse suspect"}
                </button>
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={FileSearch}
                title="Investigation tips"
                subtitle="Use these steps to strengthen your deduction."
              />

              <ul className="space-y-3 text-sm leading-6 text-gray-400">
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  Inspect evidence before accusing anyone.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  Compare alibis against the evidence.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  Every unique discovered clue adds 5 points to a correct accusation.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  Each hint reduces a correct score by 10 points.
                </li>
              </ul>
            </Panel>
          </aside>
        </div>

        <footer className="mt-10 border-t border-white/10 py-5 text-center text-xs text-gray-600">
          AI Mystery Room · Every clue matters. Every deduction counts.
        </footer>
      </main>
    </div>
  );
}
