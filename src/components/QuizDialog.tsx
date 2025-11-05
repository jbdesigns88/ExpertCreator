import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/plan";

export interface QuizDialogProps {
  open: boolean;
  title: string;
  mode: "diagnostic" | "assessment";
  questions: QuizQuestion[];
  onClose: () => void;
  onComplete: (result: QuizResult) => void;
}

export interface QuizResult {
  score: number;
  correct: number;
  total: number;
  weaknesses: Weakness[];
}

export interface Weakness {
  question: string;
  rationale: string;
  docLink: string;
}

export function QuizDialog({ open, title, mode, questions, onClose, onComplete }: QuizDialogProps) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const reset = () => {
    setResponses({});
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = () => {
    const total = questions.length;
    const correct = questions.filter((question) => responses[question.id] === question.answerIndex).length;
    const weaknesses = questions
      .filter((question) => responses[question.id] !== question.answerIndex)
      .map((question) => ({
        question: question.question,
        rationale: question.rationale,
        docLink: question.docLink
      }));
    const score = Math.round((correct / Math.max(total, 1)) * 100);
    const quizResult: QuizResult = { score, correct, total, weaknesses };
    setResult(quizResult);
    setSubmitted(true);
    onComplete(quizResult);
  };

  const closeDialog = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-indigo-600">{title}</CardTitle>
                <p className="text-sm text-slate-500">
                  {mode === "diagnostic"
                    ? "Use this quick diagnostic to baseline your current knowledge before the session."
                    : "Validate your learning outcomes with this post-session test."}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-indigo-100 bg-white/60 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-700">
                        <span className="mr-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-500">{index + 1}</span>
                        {question.question}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {question.options.map((option, optionIndex) => {
                          const checked = responses[question.id] === optionIndex;
                          const isCorrect = submitted && question.answerIndex === optionIndex;
                          const isIncorrect = submitted && checked && question.answerIndex !== optionIndex;
                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() =>
                                !submitted && setResponses((prev) => ({ ...prev, [question.id]: optionIndex }))
                              }
                              className={cn(
                                "flex items-center justify-start rounded-2xl border px-4 py-2 text-left text-sm transition",
                                checked ? "border-indigo-400 bg-indigo-50" : "border-transparent bg-white/70",
                                isCorrect && "border-emerald-400 bg-emerald-50",
                                isIncorrect && "border-rose-400 bg-rose-50",
                                submitted && !checked && "opacity-80"
                              )}
                              aria-pressed={checked}
                            >
                              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-white text-xs font-semibold text-indigo-500">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {submitted && responses[question.id] !== question.answerIndex && (
                        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                          <p className="font-semibold">Study Tip</p>
                          <p>{question.rationale}</p>
                          <a
                            className="mt-2 inline-flex items-center text-indigo-500 underline"
                            href={question.docLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Review official guidance
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={closeDialog} type="button">
                    Cancel
                  </Button>
                  <div className="flex items-center gap-3">
                    {submitted && result && (
                      <div className="rounded-2xl bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg" role="status">
                        Score {result.score}% — {result.correct}/{result.total} correct
                      </div>
                    )}
                    {!submitted && (
                      <Button
                        onClick={handleSubmit}
                        disabled={Object.keys(responses).length !== questions.length}
                        type="button"
                      >
                        Submit
                      </Button>
                    )}
                    {submitted && (
                      <Button onClick={closeDialog} type="button" variant="outline">
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
