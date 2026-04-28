export function safetyCheck(text: string, keywords: string[] = []) {
  const warnings: string[] = [];
  const lower = text.toLowerCase();

  const keywordHits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  if (keywordHits.length > 3) {
    warnings.push("This review may look over-optimized. Reduce repeated service/location keywords.");
  }

  const promotionalWords = ["best in", "number one", "guaranteed", "cheap and best", "top rated"];
  if (promotionalWords.some((word) => lower.includes(word))) {
    warnings.push("This review may sound promotional. Make it more natural.");
  }

  if (text.length < 15) {
    warnings.push("This review is too short. Add one real experience point.");
  }

  return warnings;
}
