import type { ReactElement } from 'react';
import type { MissionType } from '../../types';
import type { MissionViewModel } from './types';
import { IllustrationChoiceMission } from './components/IllustrationChoiceMission';
import { LetterIntroductionMission } from './components/LetterIntroductionMission';
import { LetterSearchMission } from './components/LetterSearchMission';
import { ReadingMission } from './components/ReadingMission';
import { SimilarLetterChoiceMission } from './components/SimilarLetterChoiceMission';
import { TextSearchMission } from './components/TextSearchMission';
import { UnsupportedMission } from './components/UnsupportedMission';
import { WordCompletionMission } from './components/WordCompletionMission';
import { WordOrderingMission } from './components/WordOrderingMission';

type MissionComponentProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
  onComplete: () => void;
};

export function MissionRegistry({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
  onComplete,
}: MissionComponentProps) {
  const missionType = viewModel.mission.missionType;
  if (viewModel.unsupported) {
    return <UnsupportedMission onComplete={onComplete} />;
  }

  const commonProps = {
    viewModel,
    selectedValue,
    disabled,
    onSelect,
  };

  const registry: Partial<Record<MissionType, ReactElement>> = {
    'letter-introduction': (
      <LetterIntroductionMission
        onComplete={onComplete}
        viewModel={viewModel}
      />
    ),
    'letter-search': <LetterSearchMission {...commonProps} />,
    'similar-letter-choice': <SimilarLetterChoiceMission {...commonProps} />,
    'illustration-letter-choice': (
      <IllustrationChoiceMission {...commonProps} />
    ),
    'illustration-word-choice': <IllustrationChoiceMission {...commonProps} />,
    'word-completion': <WordCompletionMission {...commonProps} />,
    'word-ordering': <WordOrderingMission {...commonProps} />,
    'vertical-reading': <ReadingMission {...commonProps} />,
    'horizontal-reading': <ReadingMission {...commonProps} />,
    'text-search': <TextSearchMission {...commonProps} />,
  };

  return (
    registry[missionType] ?? <UnsupportedMission onComplete={onComplete} />
  );
}
