import { PageFrame } from './PageFrame';

export function NotFoundPage() {
  return (
    <PageFrame
      description="このページは みつからなかったよ"
      showBack={false}
      title="404"
    />
  );
}
