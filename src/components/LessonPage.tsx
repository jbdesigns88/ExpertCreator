import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  FlaskConical,
  Layers,
  LineChart,
  ListChecks,
  Sparkles,
  Target
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionPlan, StudyPace, WeekPlan } from "@/lib/plan";
import { formatMinutes } from "@/lib/utils";
import type { Weakness } from "@/components/QuizDialog";

interface LessonPageProps {
  planTitle: string;
  session: SessionPlan;
  week: WeekPlan;
  pace: StudyPace;
  hoursPerWeek: number;
  onBack: () => void;
  onLaunchDiagnostic: () => void;
  onLaunchAssessment: () => void;
  diagnostic?: {
    score: number;
    passed: boolean;
    timestamp: string;
  };
  assessment?: {
    score: number;
    passed: boolean;
    timestamp: string;
  };
  weaknesses: Weakness[];
}

interface TimelineStep {
  id: string;
  title: string;
  minutes: number;
  focus: string;
  description: string;
  actions: string[];
}

const paceNarrative: Record<StudyPace, string> = {
  balanced: "Blend conceptual study with hands-on drills to keep momentum steady without burnout.",
  intensive: "Accelerate mastery by committing to extended deep-work blocks and rapid feedback cycles.",
  foundations: "Slow the cadence slightly so fundamentals are rock-solid before layering advanced tactics."
};

function buildLessonTimeline(session: SessionPlan): TimelineStep[] {
  const total = session.durationMinutes;
  const sections = session.studyGuide.sections;
  const prepMinutes = Math.max(15, Math.round(total * 0.2));
  const conceptMinutes = Math.max(20, Math.round(total * 0.35));
  const practiceMinutes = Math.max(25, Math.round(total * 0.3));
  const reflectionMinutes = Math.max(10, total - (prepMinutes + conceptMinutes + practiceMinutes));
  const perSection = sections.length ? Math.max(15, Math.round(conceptMinutes / sections.length)) : conceptMinutes;

  const timeline: TimelineStep[] = [
    {
      id: "prime",
      title: "Prime the Context",
      minutes: prepMinutes,
      focus: "Orient",
      description:
        "Anchor yourself in the scenario, success criteria, and unknowns before diving into implementation.",
      actions: [
        "Translate the lesson overview into a problem statement and explicit success metrics.",
        sections.length
          ? `Preview the ${sections.length} deep-dive modules and highlight prerequisites to refresh.`
          : "List prerequisite knowledge to refresh so the session stays focused on new insight.",
        session.focus.resources.length
          ? `Skim reference material (${session.focus.resources
              .map((resource) => resource.title)
              .join(", ")}) to map where you'll verify assumptions.`
          : "Identify authoritative docs, RFCs, or runbooks you will consult during execution."
      ]
    }
  ];

  sections.forEach((section, index) => {
    timeline.push({
      id: `module-${index + 1}`,
      title: `Module ${index + 1}: ${section.title}`,
      minutes: perSection,
      focus: "Concept Deep Dive",
      description: section.detail,
      actions:
        section.bullets && section.bullets.length > 0
          ? section.bullets
          : [
              `Document the moving parts involved in ${section.title.toLowerCase()} and how they coordinate.`,
              "Draft a concise runbook entry capturing triggers, guardrails, and escalation paths."
            ]
    });
  });

  const practiceActions =
    session.studyGuide.practice.length > 0
      ? session.studyGuide.practice.map(
          (drill) => `${drill.title}: ${drill.steps.join(" → ")}`
        )
      : [
          "Design a realistic experiment that proves the concept end-to-end.",
          "Capture logs, metrics, or screenshots that demonstrate success criteria being met."
        ];

  timeline.push({
    id: "practice",
    title: "Deliberate Practice Lab",
    minutes: practiceMinutes,
    focus: "Apply",
    description:
      "Convert conceptual clarity into reliable execution by shipping tangible artifacts and stress-testing assumptions.",
    actions: practiceActions
  });

  const reflectionPrompts =
    session.studyGuide.reflection.length > 0
      ? session.studyGuide.reflection
      : [
          "Record the heuristics or mental models you solidified during the session.",
          "List the leading indicators that will tell you the capability is production ready."
        ];

  timeline.push({
    id: "reflection",
    title: "Retrospective & Knowledge Integration",
    minutes: Math.max(10, reflectionMinutes),
    focus: "Solidify",
    description:
      "Synthesize insights, identify remaining risks, and plot the next iteration to keep momentum.",
    actions: [
      ...reflectionPrompts,
      `Outline how you'll tackle the capstone challenge: ${session.studyGuide.projectPrompt}`,
      `Schedule the ${session.quiz.length}-question assessment to validate mastery within 24 hours.`
    ]
  });

  return timeline;
}

function formatDateTime(timestamp: string) {
  try {
    return format(new Date(timestamp), "PPpp");
  } catch (error) {
    return timestamp;
  }
}

export default function LessonPage({
  planTitle,
  session,
  week,
  pace,
  hoursPerWeek,
  onBack,
  onLaunchDiagnostic,
  onLaunchAssessment,
  diagnostic,
  assessment,
  weaknesses
}: LessonPageProps) {
  const timeline = useMemo(() => buildLessonTimeline(session), [session]);
  const hasWeaknesses = weaknesses.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 pb-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to plan
          </Button>
          <div className="flex flex-wrap justify-end gap-2 text-xs">
            <Badge variant="outline">Week {week.weekNumber}</Badge>
            <Badge variant="outline">Duration {formatMinutes(session.durationMinutes)}</Badge>
            <Badge variant="outline">Pace {pace}</Badge>
            <Badge variant="default">{planTitle}</Badge>
          </div>
        </div>

        <Card className="mt-6 border-indigo-100 bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-700">
              <BookOpen className="h-6 w-6" />
              {session.topicTitle} — {session.focus.title}
            </CardTitle>
            <p className="text-sm text-slate-500">{week.theme}</p>
          </CardHeader>
          <CardContent className="space-y-5 text-slate-600">
            <p className="text-base leading-relaxed text-slate-700">{session.summary}</p>
            <p className="text-sm leading-relaxed">
              {paceNarrative[pace]} You have {hoursPerWeek} hours allocated per week; dedicate this {formatMinutes(
                session.durationMinutes
              ).toLowerCase()} block to mastering {session.focus.summary.toLowerCase()}.
            </p>
            <div className="flex flex-col gap-3 rounded-2xl bg-indigo-50/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-indigo-700">Lesson Mission</p>
                <p>
                  Internalize the end-to-end mechanics so you can architect, defend, and troubleshoot {session.focus.title.toLowerCase()} without reaching for external notes.
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Button variant="outline" size="sm" onClick={onLaunchDiagnostic}>
                  <ClipboardList className="mr-2 h-4 w-4" /> Start diagnostic
                </Button>
                <Button variant="default" size="sm" onClick={onLaunchAssessment}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Launch post-session test
                </Button>
                <p className="text-xs text-slate-500">
                  The assessment bank contains {session.quiz.length} scenario-driven questions to confirm readiness.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <Target className="h-5 w-5" /> Expert outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                By the end of the session you should be able to demonstrate these capabilities without relying on prompts or checklists.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {session.studyGuide.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-indigo-400" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <Clock className="h-5 w-5" /> Deep-work timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.map((step) => (
                <div key={step.id} className="rounded-2xl border border-indigo-100 bg-white/60 p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-indigo-700">{step.title}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{step.focus}</p>
                    </div>
                    <Badge variant="outline">{step.minutes} minutes</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                  <ul className="mt-3 ml-4 list-disc space-y-1 text-sm text-slate-700">
                    {step.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <Layers className="h-5 w-5" /> Concept mastery modules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.studyGuide.sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-indigo-700">{section.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.detail}</p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-3 ml-4 list-disc space-y-1 text-sm text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <FlaskConical className="h-5 w-5" /> Practice labs & implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.studyGuide.practice.map((drill) => (
                <div key={drill.title} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-sm font-semibold text-indigo-700">{drill.title}</p>
                  <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm text-indigo-800">
                    {drill.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Capstone challenge
                </p>
                <p className="mt-2 text-sm text-emerald-700">{session.studyGuide.projectPrompt}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <ListChecks className="h-5 w-5" /> Reflection & knowledge checks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Use these prompts to cement mental models and capture follow-up experiments immediately after the session.
              </p>
              <ul className="ml-4 list-disc space-y-1">
                {session.studyGuide.reflection.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                Once reflections are logged, run the diagnostic again in a week to verify retention and schedule the post-session test whenever you can explain the workflow without notes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <Compass className="h-5 w-5" /> Resource dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Treat these as your authoritative references. Capture annotated excerpts or code samples in your personal playbook.
              </p>
              <ul className="space-y-2">
                {session.focus.resources.map((resource) => (
                  <li key={resource.url} className="flex flex-col">
                    <span className="font-semibold text-indigo-700">{resource.title}</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-500 underline"
                    >
                      {resource.url}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <LineChart className="h-5 w-5" /> Assessment intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Diagnostic</p>
                  {diagnostic ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-semibold text-indigo-700">Score {diagnostic.score}%</p>
                      <Badge variant={diagnostic.passed ? "success" : "warning"}>
                        {diagnostic.passed ? "Passed" : "Review required"}
                      </Badge>
                      <p className="text-xs text-slate-500">{formatDateTime(diagnostic.timestamp)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No diagnostic attempt recorded yet. Run it before you dive into the content to baseline your current understanding.
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Post-session test</p>
                  {assessment ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-semibold text-indigo-700">Score {assessment.score}%</p>
                      <Badge variant={assessment.passed ? "success" : "warning"}>
                        {assessment.passed ? "Ready to advance" : "Revisit weak spots"}
                      </Badge>
                      <p className="text-xs text-slate-500">{formatDateTime(assessment.timestamp)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      Complete the test after the practice lab to validate mastery and update your belt progression.
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-sm font-semibold text-amber-700">Targeted remediation</p>
                {hasWeaknesses ? (
                  <ul className="mt-2 space-y-2">
                    {weaknesses.map((weakness) => (
                      <li key={weakness.question} className="space-y-1">
                        <p className="font-semibold text-slate-700">{weakness.question}</p>
                        <p className="text-xs text-slate-600">{weakness.rationale}</p>
                        <a
                          href={weakness.docLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-xs text-indigo-500 underline"
                        >
                          Review supporting reference
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Complete an assessment to surface knowledge gaps and populate remediation guidance automatically.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
