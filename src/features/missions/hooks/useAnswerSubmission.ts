import { useCallback, useState } from 'react';
import type { LoadedContent } from '../../../types';
import { discoverLetterOrWord } from '../../collection';
import { saveMissionSession, submitMissionAnswer } from '../MissionSession';
import type {
  MissionAnswerState,
  MissionResult,
  MissionSessionState,
} from '../types';

export function useAnswerSubmission(input: {
  content: LoadedContent;
  session: MissionSessionState | null;
  onSaved: (result: MissionResult) => void;
  onPractice: (correct: boolean) => void;
}) {
  const [answerState, setAnswerState] =
    useState<MissionAnswerState>('unanswered');
  const [firstAttemptRecorded, setFirstAttemptRecorded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const resetAnswer = useCallback(() => {
    setAnswerState('unanswered');
    setFirstAttemptRecorded(false);
    setSaving(false);
    setErrorMessage(undefined);
  }, []);

  const submit = useCallback(
    async (answer: string, responseTimeMs: number) => {
      if (!input.session || saving) {
        return;
      }

      setSaving(true);
      setErrorMessage(undefined);
      try {
        const result = await submitMissionAnswer({
          session: input.session,
          answer,
          responseTimeMs,
          content: input.content,
          firstAttemptRecorded,
        });

        if (result.status === 'saved') {
          const mission = input.session.missions[input.session.currentIndex];
          const wordIds = new Set(input.content.words.map((word) => word.id));
          const katakanaIds = new Set(
            input.content.katakana.map((letter) => letter.id),
          );
          const discoveries = result.result.targetLetterIds.map((letterId) =>
            discoverLetterOrWord({
              category: katakanaIds.has(letterId) ? 'katakana' : 'hiragana',
              targetId: letterId,
              source: result.result.missionId,
            }),
          );
          for (const targetId of mission?.targetIds ?? []) {
            if (wordIds.has(targetId)) {
              discoveries.push(
                discoverLetterOrWord({
                  category: 'word',
                  targetId,
                  source: result.result.missionId,
                }),
              );
            }
          }
          await Promise.all(discoveries);
          setFirstAttemptRecorded(true);
          setAnswerState(result.result.correct ? 'correct' : 'incorrect');
          input.onSaved(result.result);
          return;
        }

        setAnswerState(result.correct ? 'correct' : 'incorrect');
        input.onPractice(result.correct);
      } catch (error) {
        console.error('Failed to submit mission answer:', error);
        setErrorMessage('save-failed');
      } finally {
        setSaving(false);
      }
    },
    [firstAttemptRecorded, input, saving],
  );

  const save = useCallback((session: MissionSessionState) => {
    saveMissionSession(session);
  }, []);

  return {
    answerState,
    firstAttemptRecorded,
    saving,
    errorMessage,
    resetAnswer,
    submit,
    save,
  };
}
