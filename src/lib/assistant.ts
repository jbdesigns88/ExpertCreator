export interface AssistantSettings {
  apiKey?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askAssistant(question: string, context: { planSummary: string; recentWeaknesses: string[] }, settings: AssistantSettings): Promise<string> {
  if (!settings.apiKey) {
    return offlineHeuristic(question, context);
  }

  // Placeholder for future integration.
  return offlineHeuristic(question, context);
}

function offlineHeuristic(question: string, context: { planSummary: string; recentWeaknesses: string[] }) {
  const normalized = question.toLowerCase();
  const hints: string[] = [];
  if (normalized.includes("resource")) {
    hints.push("Review the session resources and official documentation linked in your plan.");
  }
  if (context.recentWeaknesses.length) {
    hints.push(`Focus on these improvement areas: ${context.recentWeaknesses.join(", ")}.`);
  }
  if (normalized.includes("quiz") || normalized.includes("test")) {
    hints.push("Revisit diagnostic questions and articulate the rationale for each answer to reinforce understanding.");
  }
  const summary = context.planSummary ? `Plan focus: ${context.planSummary}.` : "Keep progressing through your scheduled sessions.";
  return [summary, ...hints, "Break concepts into smaller drills and commit them to memory with spaced reviews."].join("\n\n");
}
