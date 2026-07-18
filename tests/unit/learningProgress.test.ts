import { describe, expect, it } from 'vitest';
import { isStrugglingLetter } from '../../src/utils/learningProgress';

describe('isStrugglingLetter', () => {
  it('3回以上出題され、正答率70%以下なら苦手文字と判定する', () => {
    expect(isStrugglingLetter({ attempts: 10, correct: 7 })).toBe(true);
  });

  it('出題回数が3回未満なら苦手文字にしない', () => {
    expect(isStrugglingLetter({ attempts: 2, correct: 0 })).toBe(false);
  });
});
