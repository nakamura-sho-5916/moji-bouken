import type { ContentValidationIssue } from '../../types';

export class ContentValidationError extends Error {
  constructor(public readonly issues: ContentValidationIssue[]) {
    super('教材データを確認できませんでした。');
    this.name = 'ContentValidationError';
  }
}
