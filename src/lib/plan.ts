import { topics, type TopicId, type TopicConfig, type FocusArea, type QuizTemplate } from "@/data/topics";
import { format } from "date-fns";
import { safeId } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  rationale: string;
  docLink: string;
}

export interface SessionPlan {
  id: string;
  topicId: TopicId;
  topicTitle: string;
  focus: FocusArea;
  durationMinutes: number;
  summary: string;
  quiz: QuizQuestion[];
}

export interface WeekPlan {
  id: string;
  weekNumber: number;
  theme: string;
  summary: string;
  sessions: SessionPlan[];
}

export type StudyPace = "balanced" | "intensive" | "foundations";

export interface ExpertPlan {
  id: string;
  title: string;
  createdAt: string;
  topics: TopicId[];
  weeks: number;
  hoursPerWeek: number;
  weeksData: WeekPlan[];
  completedSessionIds: string[];
  pace: StudyPace;
  personalNote: string;
  autoCompleteOnPass: boolean;
}

export interface PlanRequest {
  selectedTopics: TopicId[];
  weeks: number;
  hoursPerWeek: number;
  pace: StudyPace;
}

export function generatePlan(request: PlanRequest): ExpertPlan {
  const { selectedTopics, weeks, hoursPerWeek, pace } = request;
  const planId = safeId("plan");
  const createdAt = new Date().toISOString();
  const title = `ExpertMaker Plan — ${format(new Date(createdAt), "PP")}`;
  const paceDescriptions: Record<StudyPace, string> = {
    balanced: "Balance new concepts with consistent repetition and reflection.",
    intensive: "Accelerate outcomes with extended sessions and deep dives into production scenarios.",
    foundations: "Focus on core fundamentals and deliberate practice drills to cement understanding."
  };

  const topicsConfigs = selectedTopics
    .map((id) => topics.find((topic) => topic.id === id))
    .filter((topic): topic is TopicConfig => Boolean(topic));

  const weeksData: WeekPlan[] = Array.from({ length: weeks }).map((_, weekIndex) => {
    const sessions = topicsConfigs.map((topic, topicIndex) => {
      const focus = chooseFocus(topic, weekIndex + topicIndex);
      const quiz = buildQuiz(topic, focus.id);
      return {
        id: safeId(`session-${topic.id}-${weekIndex + 1}`),
        topicId: topic.id,
        topicTitle: topic.title,
        focus,
        durationMinutes: clampSessionMinutes(hoursPerWeek, topicsConfigs.length),
        summary: `${focus.summary} Emphasize deliberate drills for ${topic.title.toLowerCase()} fundamentals and ship a tangible artifact by the end of the session.`,
        quiz
      } satisfies SessionPlan;
    });

    const weekTheme = sessions
      .map((session) => `${session.topicTitle}: ${session.focus.title}`)
      .join(" • ");

    return {
      id: safeId(`week-${weekIndex + 1}`),
      weekNumber: weekIndex + 1,
      theme: `Week ${weekIndex + 1}: ${weekTheme}`,
      summary: `${paceDescriptions[pace]} Plan ${sessions.length} focus blocks across ${topicsConfigs.length} topics and capture takeaways after every diagnostic.`,
      sessions
    } satisfies WeekPlan;
  });

  return {
    id: planId,
    title,
    createdAt,
    topics: selectedTopics,
    weeks,
    hoursPerWeek,
    weeksData,
    completedSessionIds: [],
    pace,
    personalNote: "",
    autoCompleteOnPass: true
  } satisfies ExpertPlan;
}

function chooseFocus(topic: TopicConfig, offset: number): FocusArea {
  const index = offset % topic.focusAreas.length;
  return topic.focusAreas[index];
}

function buildQuiz(topic: TopicConfig, focusId: string): QuizQuestion[] {
  const questions = topic.quizBank.filter((item) => item.focusId === focusId);
  const fallback = topic.quizBank.filter((item) => item.focusId !== focusId);
  const pool = [...questions, ...fallback];
  return pool.slice(0, Math.min(4, pool.length)).map(toQuizQuestion);
}

function toQuizQuestion(template: QuizTemplate): QuizQuestion {
  return {
    id: template.id,
    question: template.question,
    options: template.options,
    answerIndex: template.answerIndex,
    rationale: template.rationale,
    docLink: template.docLink
  };
}

function clampSessionMinutes(hoursPerWeek: number, topicCount: number) {
  const totalMinutes = hoursPerWeek * 60;
  const perSession = Math.round(totalMinutes / Math.max(topicCount, 1));
  return Math.min(90, Math.max(60, perSession));
}

export function serializePlan(plan: ExpertPlan) {
  return JSON.stringify(plan);
}

export function deserializePlan(json: string): ExpertPlan {
  const data = JSON.parse(json) as ExpertPlan;
  if (!data || !Array.isArray(data.weeksData)) {
    throw new Error("Invalid plan payload");
  }
  if (!Array.isArray(data.completedSessionIds)) {
    data.completedSessionIds = [];
  }
  if (!data.pace) {
    data.pace = "balanced";
  }
  if (typeof data.personalNote !== "string") {
    data.personalNote = "";
  }
  if (typeof data.autoCompleteOnPass !== "boolean") {
    data.autoCompleteOnPass = true;
  }
  return data;
}
