export function normalizeAnswer(answer: string) {
  return answer.normalize('NFC').trim();
}
