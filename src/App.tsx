import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Download,
  FlaskConical,
  Loader2,
  Play,
  Send,
  Settings2,
  Sparkles,
  TestTube,
  Upload,
  Volume2
} from "lucide-react";
import { motion } from "framer-motion";

import { topics, type TopicId } from "@/data/topics";
import {
  type ExpertPlan,
  type SessionPlan,
  type StudyPace,
  generatePlan,
  deserializePlan,
  serializePlan
} from "@/lib/plan";
import { formatMinutes } from "@/lib/utils";
import {
  applyTestResult,
  computeProgress,
  DEFAULT_RANK_CONFIG,
  formatBelt,
  initialRankState,
  type RankConfig,
  type RankState
} from "@/lib/rank";
import { askAssistant, type AssistantSettings, type ChatMessage } from "@/lib/assistant";
import { initDatabase, type DatabaseHandles } from "@/lib/sql-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { QuizDialog, type QuizResult } from "@/components/QuizDialog";
import type { Weakness } from "@/components/QuizDialog";
import { useDebouncedEffect } from "@/hooks/use-debounce";

interface TestRecord {
  id: string;
  taskId: string;
  score: number;
  passed: boolean;
  timestamp: string;
  weaknesses: Weakness[];
  mode: "diagnostic" | "assessment";
  sessionId: string;
}

const DEFAULT_TOPICS: TopicId[] = ["oauth", "rag", "node", "system"];
const MAX_WEEKS = 12;
const MIN_WEEKS = 1;

function App() {
  const [handles, setHandles] = useState<DatabaseHandles | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<ExpertPlan | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>(DEFAULT_TOPICS);
  const [weeks, setWeeks] = useState(6);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [rankState, setRankState] = useState<RankState>(initialRankState());
  const [rankConfig, setRankConfig] = useState<RankConfig>(DEFAULT_RANK_CONFIG);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [quizState, setQuizState] = useState<{
    open: boolean;
    session: SessionPlan | null;
    mode: "diagnostic" | "assessment";
  }>({ open: false, session: null, mode: "diagnostic" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>({});
  const [pace, setPace] = useState<StudyPace>("balanced");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    const controller = new AbortController();
    initDatabase()
      .then((dbHandles) => {
        if (controller.signal.aborted) return;
        setHandles(dbHandles);
        hydrateFromDb(dbHandles);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
    return () => {
      controller.abort();
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setPlan((prev) => (prev ? { ...prev, pace } : prev));
  }, [pace]);

  const hydrateFromDb = (dbHandles: DatabaseHandles) => {
    const { db } = dbHandles;
    try {
      const planRows = db.exec("SELECT id, json FROM plans ORDER BY createdAt DESC LIMIT 1");
      if (planRows.length && planRows[0].values.length) {
        const [id, json] = planRows[0].values[0] as [string, string];
        const restored = deserializePlan(json);
        setPlan(restored);
        setSelectedTopics(restored.topics);
        setWeeks(restored.weeks);
        setHoursPerWeek(restored.hoursPerWeek);
        setPace(restored.pace);
      }
      const rankRows = db.exec("SELECT k, v FROM rank");
      rankRows.forEach((row) => {
        row.values.forEach(([key, value]) => {
          if (key === "state") {
            try {
              const parsed = JSON.parse(value as string) as RankState;
              setRankState(parsed);
            } catch (error) {
              console.error("Failed to parse rank state", error);
            }
          }
          if (key === "config") {
            try {
              const parsed = JSON.parse(value as string) as RankConfig;
              setRankConfig(parsed);
            } catch (error) {
              console.error("Failed to parse rank config", error);
            }
          }
        });
      });
      const testRows = db.exec(
        "SELECT id, taskId, score, passed, timestamp, weaknesses FROM tests ORDER BY timestamp ASC"
      );
      const restoredTests: TestRecord[] = [];
      testRows.forEach((row) => {
        row.values.forEach(([id, taskId, score, passed, timestamp, weaknesses]) => {
          try {
            const parsedWeaknesses = weaknesses
              ? (JSON.parse(weaknesses as string) as Weakness[])
              : [];
            const mode = taskId.toString().endsWith("-assessment") ? "assessment" : "diagnostic";
            const sessionId = taskId.toString().split("::")[0];
            restoredTests.push({
              id: id as string,
              taskId: taskId as string,
              score: Number(score),
              passed: Boolean(Number(passed)),
              timestamp: timestamp as string,
              weaknesses: parsedWeaknesses,
              mode,
              sessionId
            });
          } catch (error) {
            console.error("Failed to parse weaknesses", error);
          }
        });
      });
      setTests(restoredTests);
    } finally {
      setLoading(false);
    }
  };

  useDebouncedEffect(() => {
    if (!handles || !plan) return;
    const { db, persist } = handles;
    db.run("DELETE FROM plans");
    const stmt = db.prepare("INSERT INTO plans (id, title, createdAt, json) VALUES (?, ?, ?, ?)");
    stmt.run([plan.id, plan.title, plan.createdAt, serializePlan(plan)]);
    stmt.free();
    persist().catch((error) => console.error(error));
  }, [plan, handles], 600);

  useDebouncedEffect(() => {
    if (!handles) return;
    const { db, persist } = handles;
    db.run("INSERT OR REPLACE INTO rank (k, v) VALUES (?, ?)", ["state", JSON.stringify(rankState)]);
    db.run("INSERT OR REPLACE INTO rank (k, v) VALUES (?, ?)", ["config", JSON.stringify(rankConfig)]);
    persist().catch((error) => console.error(error));
  }, [rankState, rankConfig, handles], 600);

  const recentWeaknesses = useMemo(() => {
    return tests
      .filter((test) => test.mode === "assessment")
      .slice(-6)
      .flatMap((test) => test.weaknesses.map((weakness) => weakness.question));
  }, [tests]);

  const planSummary = useMemo(() => {
    if (!plan) return "";
    const focus = plan.weeksData
      .map((week) => week.sessions.map((session) => `${session.topicTitle} — ${session.focus.title}`).join(", "))
      .join("; ");
    return `Weeks: ${plan.weeks}, Pace: ${plan.pace}, Topics: ${plan.topics.length}. Focus: ${focus}`;
  }, [plan]);

  const progress = computeProgress(rankState, rankConfig);

  const openQuiz = (session: SessionPlan, mode: "diagnostic" | "assessment") => {
    setQuizState({ open: true, session, mode });
  };

  const closeQuiz = () => setQuizState((prev) => ({ ...prev, open: false }));

  const handleQuizComplete = (result: QuizResult) => {
    const session = quizState.session;
    if (!handles || !session) return;
    const mode = quizState.mode;
    const testId =
      typeof window !== "undefined" && window.crypto && "randomUUID" in window.crypto
        ? window.crypto.randomUUID()
        : `test-${Date.now()}`;
    const taskKey = `${session.id}::${mode}`;
    const record: TestRecord = {
      id: testId,
      taskId: taskKey,
      score: result.score,
      passed: result.score >= rankConfig.passScore,
      timestamp: new Date().toISOString(),
      weaknesses: result.weaknesses,
      mode,
      sessionId: session.id
    };

    const { db, persist } = handles;
    db.run(
      "INSERT OR REPLACE INTO tests (id, taskId, score, passed, timestamp, weaknesses) VALUES (?, ?, ?, ?, ?, ?)",
      [
        record.id,
        record.taskId,
        record.score,
        record.passed ? 1 : 0,
        record.timestamp,
        JSON.stringify(record.weaknesses)
      ]
    );
    persist().catch((error) => console.error(error));
    setTests((prev) => [...prev, record]);

    if (mode === "assessment") {
      const { state: updated, awardedPoints } = applyTestResult(rankState, rankConfig, result.score);
      setRankState(updated);
      if (record.passed && plan?.autoCompleteOnPass) {
        const alreadyCompleted = new Set(plan.completedSessionIds);
        if (!alreadyCompleted.has(session.id)) {
          alreadyCompleted.add(session.id);
          setPlan({ ...plan, completedSessionIds: Array.from(alreadyCompleted) });
        }
      }
      const message = record.passed
        ? `Great job! Earned ${awardedPoints} points toward your next stripe.`
        : `Keep going! ${awardedPoints} review point added. Check the study plan for gaps.`;
      setFeedback(message);
    } else {
      setFeedback("Diagnostic captured. Tailor your study using the guidance below.");
    }
  };

  const toggleTopic = (topicId: TopicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleGenerate = () => {
    if (!selectedTopics.length) {
      setFeedback("Select at least one topic to generate a plan.");
      return;
    }
    const generated = generatePlan({ selectedTopics, weeks, hoursPerWeek, pace });
    setPlan(generated);
    setTests([]);
    setRankState(initialRankState());
    setFeedback("Plan generated. Review diagnostics before starting each session.");
    if (handles) {
      handles.db.run("DELETE FROM tests");
      handles.db.run("INSERT OR REPLACE INTO rank (k, v) VALUES (?, ?)", [
        "state",
        JSON.stringify(initialRankState())
      ]);
      handles.db.run("INSERT OR REPLACE INTO rank (k, v) VALUES (?, ?)", [
        "config",
        JSON.stringify(rankConfig)
      ]);
      handles.persist().catch((error) => console.error(error));
    }
  };

  const handleExport = () => {
    if (!plan) return;
    const blob = new Blob([serializePlan(plan)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.title.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const imported = deserializePlan(text);
        setPlan(imported);
        setSelectedTopics(imported.topics);
        setWeeks(imported.weeks);
        setHoursPerWeek(imported.hoursPerWeek);
        setPace(imported.pace);
        setFeedback(`Imported plan ${imported.title}`);
      } catch (error) {
        console.error(error);
        setFeedback("Unable to import plan. The file may be malformed.");
      }
    };
    reader.readAsText(file);
  };

  const speakWeek = (weekNumber: number) => {
    if (!speechSupported || !plan) {
      setFeedback("Text to Speech is not available in this browser.");
      return;
    }
    const week = plan.weeksData.find((item) => item.weekNumber === weekNumber);
    if (!week) return;
    window.speechSynthesis.cancel();
    const text = `${week.theme}. ${week.summary}. Sessions include ${week.sessions
      .map((session) => `${session.topicTitle} focusing on ${session.focus.title}`)
      .join("; ")}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const submitChat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = (formData.get("message") as string)?.trim();
    if (!message) return;
    const userMessage: ChatMessage = { role: "user", content: message };
    setChatMessages((prev) => [...prev, userMessage]);
    form.reset();
    const placeholder: ChatMessage = { role: "assistant", content: "Thinking..." };
    setChatMessages((prev) => [...prev, placeholder]);
    try {
      const response = await askAssistant(
        message,
        {
          planSummary,
          recentWeaknesses
        },
        assistantSettings
      );
      setChatMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: response }]);
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I ran into an issue replying. Please try again."
        }
      ]);
    }
  };

  const sessionWeaknesses = useMemo(() => {
    const map = new Map<string, Weakness[]>();
    tests
      .filter((test) => test.mode === "assessment" && test.weaknesses.length)
      .forEach((test) => {
        map.set(test.sessionId, test.weaknesses);
      });
    return map;
  }, [tests]);

  const diagnosticScores = useMemo(() => {
    const map = new Map<string, TestRecord>();
    tests
      .filter((test) => test.mode === "diagnostic")
      .forEach((test) => {
        map.set(test.sessionId, test);
      });
    return map;
  }, [tests]);

  const assessmentScores = useMemo(() => {
    const map = new Map<string, TestRecord>();
    tests
      .filter((test) => test.mode === "assessment")
      .forEach((test) => {
        map.set(test.sessionId, test);
      });
    return map;
  }, [tests]);

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-indigo-600">ExpertMaker</h1>
            <p className="text-sm text-slate-500">
              Local-first lesson planning studio with Brazilian Jiu-Jitsu belt progression.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-indigo-500/20 text-indigo-600">
                {formatBelt(rankState)} Belt
              </Badge>
              <Badge variant="outline">Stripes: {rankState.stripes}</Badge>
              <Badge variant="outline">Points: {rankState.points}</Badge>
            </div>
            <div className="w-64">
              <Progress value={progress} />
              <p className="mt-1 text-xs text-slate-500">Overall progress {progress}%</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto mt-8 flex max-w-6xl flex-col gap-6 px-6 lg:flex-row">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-80"
        >
          <Card className="space-y-6 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold text-indigo-600">Plan Builder</CardTitle>
            </CardHeader>
            <div>
              <label className="text-sm font-medium text-slate-600">Study Pace</label>
              <Select value={pace} onValueChange={(value) => setPace(value as StudyPace)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="foundations">Foundations</SelectItem>
                  <SelectItem value="intensive">Intensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Topics</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {topics.map((topic) => {
                  const active = selectedTopics.includes(topic.id as TopicId);
                  return (
                    <Button
                      key={topic.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => toggleTopic(topic.id as TopicId)}
                      aria-pressed={active}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {topic.title}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Timeline (weeks)</span>
                <span>{weeks}</span>
              </div>
              <Slider
                min={MIN_WEEKS}
                max={MAX_WEEKS}
                step={1}
                value={[weeks]}
                onValueChange={([value]) => setWeeks(value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Hours per week</span>
                <span>{hoursPerWeek}</span>
              </div>
              <Slider
                min={2}
                max={20}
                step={1}
                value={[hoursPerWeek]}
                onValueChange={([value]) => setHoursPerWeek(value)}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Generate Plan
            </Button>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                <Button variant="outline" className="w-full" onClick={handleExport} disabled={!plan}>
                  <Download className="mr-2 h-4 w-4" /> Export Plan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Import Plan
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/json"
                onChange={handleImport}
              />
            </div>
            <Tabs defaultValue="ranking" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="ranking" className="flex-1 text-xs">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Ranking
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 text-xs">
                  <Settings2 className="mr-2 h-4 w-4" /> Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ranking" className="pt-4">
                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    PASS SCORE <strong>{rankConfig.passScore}</strong> · PASS POINTS
                    <strong className="ml-1">{rankConfig.passPoints}</strong> · REVIEW POINTS
                    <strong className="ml-1">{rankConfig.failPoints}</strong>
                  </p>
                  <p>
                    Stripes require <strong>{rankConfig.pointsPerStripe}</strong> points. Belts require
                    {" "}
                    <strong>{rankConfig.stripesPerBelt}</strong> stripes.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="settings" className="pt-4">
                <div className="space-y-4 text-sm">
                  <label className="flex items-center justify-between">
                    <span>Pass score</span>
                    <Input
                      type="number"
                      value={rankConfig.passScore}
                      onChange={(event) =>
                        setRankConfig((prev) => ({ ...prev, passScore: Number(event.target.value) }))
                      }
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Points per stripe</span>
                    <Input
                      type="number"
                      value={rankConfig.pointsPerStripe}
                      onChange={(event) =>
                        setRankConfig((prev) => ({ ...prev, pointsPerStripe: Number(event.target.value) }))
                      }
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Stripes per belt</span>
                    <Input
                      type="number"
                      value={rankConfig.stripesPerBelt}
                      onChange={(event) =>
                        setRankConfig((prev) => ({ ...prev, stripesPerBelt: Number(event.target.value) }))
                      }
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Points on pass</span>
                    <Input
                      type="number"
                      value={rankConfig.passPoints}
                      onChange={(event) =>
                        setRankConfig((prev) => ({ ...prev, passPoints: Number(event.target.value) }))
                      }
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Points on review</span>
                    <Input
                      type="number"
                      value={rankConfig.failPoints}
                      onChange={(event) =>
                        setRankConfig((prev) => ({ ...prev, failPoints: Number(event.target.value) }))
                      }
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Auto-complete on pass</span>
                    <Switch
                      checked={plan?.autoCompleteOnPass ?? true}
                      disabled={!plan}
                      onCheckedChange={(checked) =>
                        setPlan((prev) => (prev ? { ...prev, autoCompleteOnPass: checked } : prev))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>LLM API Key</span>
                    <Input
                      type="password"
                      value={assistantSettings.apiKey ?? ""}
                      onChange={(event) =>
                        setAssistantSettings((prev) => ({ ...prev, apiKey: event.target.value }))
                      }
                      placeholder="Optional"
                      className="w-48"
                    />
                  </label>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Personal Intent
                    </p>
                    <Textarea
                      placeholder="Write how you plan to apply this sprint in practice."
                      value={plan?.personalNote ?? ""}
                      disabled={!plan}
                      onChange={(event) =>
                        setPlan((prev) => (prev ? { ...prev, personalNote: event.target.value } : prev))
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-indigo-100 bg-white/70 p-4 text-sm text-indigo-600 shadow"
            >
              {feedback}
            </motion.div>
          )}
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-6"
        >
          {loading && (
            <div className="flex items-center justify-center rounded-2xl border border-indigo-100 bg-white/70 p-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-sm text-slate-500">Initializing local database…</span>
            </div>
          )}
          {!plan && !loading && (
            <Card className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-indigo-400" />
              <h2 className="mt-4 text-lg font-semibold text-indigo-600">Start your journey</h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose topics, configure your schedule, then generate a tailored learning roadmap complete with diagnostics and tests.
              </p>
            </Card>
          )}
          {plan && (
            <div className="space-y-6">
              {plan.personalNote && (
                <Card className="border-indigo-200 bg-indigo-50/60 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Personal Intent
                  </p>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{plan.personalNote}</p>
                </Card>
              )}
              {plan.weeksData.map((week) => (
                <motion.div key={week.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-white">{week.theme}</CardTitle>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-white/40 text-white">
                              Pace: {plan.pace}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-indigo-100">{week.summary}</p>
                        </div>
                        <Button variant="outline" onClick={() => speakWeek(week.weekNumber)}>
                          <Volume2 className="mr-2 h-4 w-4" />
                          TTS Summary
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-white/90 p-6">
                      {week.sessions.map((session) => {
                        const diagnostic = diagnosticScores.get(session.id);
                        const assessment = assessmentScores.get(session.id);
                        const weaknesses = sessionWeaknesses.get(session.id) ?? [];
                        const completed = plan.completedSessionIds.includes(session.id);
                        return (
                          <motion.div
                            key={session.id}
                            className="rounded-2xl border border-indigo-100 bg-white/70 p-4 shadow-sm"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-indigo-600">
                                  {session.topicTitle}
                                  <span className="ml-2 text-sm font-normal text-slate-500">
                                    {session.focus.title}
                                  </span>
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">{session.summary}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                  <Badge variant="outline">Duration {formatMinutes(session.durationMinutes)}</Badge>
                                  {completed && <Badge variant="success">Completed</Badge>}
                                  {diagnostic && (
                                    <Badge variant={diagnostic.passed ? "success" : "warning"}>
                                      Diagnostic {diagnostic.score}%
                                    </Badge>
                                  )}
                                  {assessment && (
                                    <Badge variant={assessment.passed ? "success" : "warning"}>
                                      Test {assessment.score}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-start gap-2 md:items-end">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openQuiz(session, "diagnostic")">
                                    <FlaskConical className="mr-2 h-4 w-4" /> Diagnostic
                                  </Button>
                                  <Button variant="default" size="sm" onClick={() => openQuiz(session, "assessment")">
                                    <TestTube className="mr-2 h-4 w-4" /> Test
                                  </Button>
                                </div>
                                <Button
                                  variant={completed ? "ghost" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    setPlan((prev) => {
                                      if (!prev) return prev;
                                      const set = new Set(prev.completedSessionIds);
                                      if (set.has(session.id)) {
                                        set.delete(session.id);
                                      } else {
                                        set.add(session.id);
                                      }
                                      return { ...prev, completedSessionIds: Array.from(set) };
                                    })
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {completed ? "Mark as Incomplete" : "Mark Complete"}
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Resources
                                </p>
                                <ul className="mt-2 space-y-1 text-sm">
                                  {session.focus.resources.map((resource) => (
                                    <li key={resource.url}>
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-500 underline"
                                      >
                                        {resource.title}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Study Plan
                                </p>
                                {weaknesses.length ? (
                                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                    {weaknesses.map((weakness) => (
                                      <li key={weakness.question} className="rounded-xl bg-amber-50 p-3">
                                        <p className="font-semibold text-amber-700">{weakness.question}</p>
                                        <p className="text-xs text-amber-700">{weakness.rationale}</p>
                                        <a
                                          href={weakness.docLink}
                                          className="mt-1 inline-flex text-xs text-indigo-500 underline"
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Review reference
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-500">
                                    Complete the assessment to generate a targeted study plan.
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                  <Bot className="h-5 w-5" /> AI Study Partner
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Offline-friendly assistant synthesizing plan context. Provide your own API key in settings to connect any LLM.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-48 overflow-y-auto rounded-2xl border border-indigo-100 bg-white/60 p-4 text-sm text-slate-600">
                  {chatMessages.length === 0 && <p>Ask about study tactics, tricky quiz items, or resource prioritization.</p>}
                  {chatMessages.map((message, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-xs uppercase tracking-wider text-indigo-400">{message.role}</p>
                      <p className="whitespace-pre-wrap text-slate-600">{message.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={submitChat} className="flex gap-2">
                  <Input name="message" placeholder="Ask for drills, doc links, or summaries" autoComplete="off" />
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </motion.section>
      </main>
      <QuizDialog
        open={quizState.open}
        title={quizState.mode === "diagnostic" ? "Diagnostic Quiz" : "Post-Session Test"}
        mode={quizState.mode}
        questions={quizState.session?.quiz ?? []}
        onClose={closeQuiz}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}

export default App;
