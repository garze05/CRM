export const QUOTE_AI_ESTIMATE = {
	inputTokens: 900,
	outputTokens: 180,
} as const;

export const QUOTE_AI_MODELS = [
	{
		id: "google/gemini-3.1-flash-lite",
		label: "Gemini 3.1 Flash Lite",
		inputUsdPerMillion: 0.25,
		outputUsdPerMillion: 1.5,
	},
	{
		id: "deepseek/deepseek-v4-flash",
		label: "DeepSeek V4 Flash",
		inputUsdPerMillion: 0.09,
		outputUsdPerMillion: 0.18,
	},
	{
		id: "openai/gpt-4o-mini",
		label: "GPT-4o mini",
		inputUsdPerMillion: 0.15,
		outputUsdPerMillion: 0.6,
	},
] as const;

export type QuoteAiModelId = (typeof QUOTE_AI_MODELS)[number]["id"];

export const DEFAULT_QUOTE_AI_MODEL: QuoteAiModelId =
	"google/gemini-3.1-flash-lite";

export function isQuoteAiModelId(value: string): value is QuoteAiModelId {
	return QUOTE_AI_MODELS.some(model => model.id === value);
}

export function quoteAiModelOrDefault(value: string | null): QuoteAiModelId {
	return value && isQuoteAiModelId(value) ? value : DEFAULT_QUOTE_AI_MODEL;
}

export function estimateQuoteAiCostUsd(modelId: QuoteAiModelId): number {
	const model =
		QUOTE_AI_MODELS.find(option => option.id === modelId) ?? QUOTE_AI_MODELS[0];
	return (
		(QUOTE_AI_ESTIMATE.inputTokens / 1_000_000) * model.inputUsdPerMillion +
		(QUOTE_AI_ESTIMATE.outputTokens / 1_000_000) * model.outputUsdPerMillion
	);
}

export function formatUsdEstimate(value: number): string {
	if (value < 0.01) return `< US$0.01`;
	return `US$${value.toFixed(2)}`;
}
