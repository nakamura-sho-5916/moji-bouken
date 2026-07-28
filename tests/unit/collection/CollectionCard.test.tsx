import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CollectionCard } from '../../../src/features/collection/components/CollectionCard';

describe('CollectionCard', () => {
  it('shows NEW only for discovered newly acquired collection entries', () => {
    render(
      <CollectionCard
        description="Rare / 10G"
        discovered
        icon="★"
        newlyDiscovered
        title="ことばの ゆびわ"
      />,
    );

    expect(screen.getByText('NEW')).toBeVisible();
    expect(screen.getByText('ことばの ゆびわ')).toBeVisible();
  });

  it('keeps hidden entries concealed', () => {
    render(
      <CollectionCard
        description="Rare / 10G"
        discovered={false}
        icon="★"
        newlyDiscovered
        title="ことばの ゆびわ"
      />,
    );

    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    expect(screen.queryByText('ことばの ゆびわ')).not.toBeInTheDocument();
    expect(screen.getByText('まだ であっていないよ')).toBeVisible();
  });
});
