import hiraganaData from '../hiragana.json';
import katakanaData from '../katakana.json';
import wordsData from '../words.json';
import illustrationsData from '../illustrations.json';
import similarLettersData from '../similarLetters.json';
import introductionMissions from '../missions/introduction.json';
import letterSearchMissions from '../missions/letterSearch.json';
import similarLetterMissions from '../missions/similarLetter.json';
import illustrationChoiceMissions from '../missions/illustrationChoice.json';
import illustrationWordMissions from '../missions/illustrationWord.json';
import wordCompletionMissions from '../missions/wordCompletion.json';
import wordOrderingMissions from '../missions/wordOrdering.json';
import verticalReadingMissions from '../missions/verticalReading.json';
import horizontalReadingMissions from '../missions/horizontalReading.json';
import textSearchMissions from '../missions/textSearch.json';
import bossMissions from '../missions/boss.json';
import type {
  ContentLetter,
  ContentMission,
  ContentValidationIssue,
  ContentWord,
  IllustrationReference,
  LoadedContent,
  SimilarLetterGroup,
} from '../../types';
import {
  validateContentReferences,
  validateMissions,
} from './contentValidator';

const missionSources = [
  ['introduction.json', introductionMissions],
  ['letterSearch.json', letterSearchMissions],
  ['similarLetter.json', similarLetterMissions],
  ['illustrationChoice.json', illustrationChoiceMissions],
  ['illustrationWord.json', illustrationWordMissions],
  ['wordCompletion.json', wordCompletionMissions],
  ['wordOrdering.json', wordOrderingMissions],
  ['verticalReading.json', verticalReadingMissions],
  ['horizontalReading.json', horizontalReadingMissions],
  ['textSearch.json', textSearchMissions],
  ['boss.json', bossMissions],
] as const;

let cachedContent: LoadedContent | null = null;

export function loadLearningContent(): LoadedContent {
  if (cachedContent) {
    return cachedContent;
  }

  const validationIssues: ContentValidationIssue[] = [];
  const missions: ContentMission[] = [];

  for (const [fileName, rawMissions] of missionSources) {
    const result = validateMissions(rawMissions, fileName);
    missions.push(...result.valid);
    validationIssues.push(...result.issues);
  }

  const content = {
    hiragana: hiraganaData as ContentLetter[],
    katakana: katakanaData as ContentLetter[],
    words: wordsData as ContentWord[],
    illustrations: illustrationsData as IllustrationReference[],
    similarLetters: similarLettersData as SimilarLetterGroup[],
    missions,
  };

  validationIssues.push(...validateContentReferences(content));

  if (import.meta.env.DEV && validationIssues.length > 0) {
    console.error('Content validation issues:', validationIssues);
  }

  cachedContent = { ...content, validationIssues };
  return cachedContent;
}

export function resetLearningContentCacheForTests() {
  cachedContent = null;
}
