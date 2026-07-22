import { EffectBurst } from './EffectBurst';

type AnswerEffectProps = {
  correct: boolean;
};

export function AnswerEffect({ correct }: AnswerEffectProps) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
      data-testid={correct ? 'answer-effect-correct' : 'answer-effect-retry'}
    >
      <EffectBurst size="sm" tone={correct ? 'success' : 'warning'} />
    </span>
  );
}
