export function calculateAccuracy(correctCount: number, attempts: number) {
  if (attempts <= 0) {
    return 0;
  }

  const accuracy = correctCount / attempts;
  return Math.min(1, Math.max(0, Math.round(accuracy * 10000) / 10000));
}
