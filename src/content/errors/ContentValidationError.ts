import type { ContentValidationIssue } from '../../types';

export class ContentValidationError extends Error {
  constructor(public readonly issues: ContentValidationIssue[]) {
    super('教材データの検証に失敗しました。');
    this.name = 'ContentValidationError';
  }
}
