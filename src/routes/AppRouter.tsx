import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { LoadingScreen } from '../components/LoadingScreen';
import { useLocation, useNavigate } from '../router';
import { pageTransition } from '../utils/motion';
import { BattlePage } from '../pages/BattlePage';
import { HomePage } from '../pages/HomePage';
import { MissionPage } from '../pages/MissionPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ResultPage } from '../pages/ResultPage';
import { TitlePage } from '../pages/TitlePage';

const WorldPage = lazy(() =>
  import('../pages/WorldPage').then((module) => ({
    default: module.WorldPage,
  })),
);
const CollectionPage = lazy(() =>
  import('../pages/CollectionPage').then((module) => ({
    default: module.CollectionPage,
  })),
);
const CompanionsPage = lazy(() =>
  import('../pages/CompanionsPage').then((module) => ({
    default: module.CompanionsPage,
  })),
);
const EquipmentPage = lazy(() =>
  import('../pages/EquipmentPage').then((module) => ({
    default: module.EquipmentPage,
  })),
);
const ShopPage = lazy(() =>
  import('../pages/ShopPage').then((module) => ({
    default: module.ShopPage,
  })),
);
const ParentPage = lazy(() =>
  import('../pages/ParentPage').then((module) => ({
    default: module.ParentPage,
  })),
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);
const DebugContentPage = lazy(() =>
  import('../pages/DebugContentPage').then((module) => ({
    default: module.DebugContentPage,
  })),
);
const DebugDataPage = lazy(() =>
  import('../pages/DebugDataPage').then((module) => ({
    default: module.DebugDataPage,
  })),
);
const DebugLearningPage = lazy(() =>
  import('../pages/DebugLearningPage').then((module) => ({
    default: module.DebugLearningPage,
  })),
);
const DebugMissionsPage = lazy(() =>
  import('../pages/DebugMissionsPage').then((module) => ({
    default: module.DebugMissionsPage,
  })),
);
const DebugBattlePage = lazy(() =>
  import('../pages/DebugBattlePage').then((module) => ({
    default: module.DebugBattlePage,
  })),
);
const DebugBossPage = lazy(() =>
  import('../pages/DebugBossPage').then((module) => ({
    default: module.DebugBossPage,
  })),
);
const DebugWorldPage = lazy(() =>
  import('../pages/DebugWorldPage').then((module) => ({
    default: module.DebugWorldPage,
  })),
);
const DebugCollectionPage = lazy(() =>
  import('../pages/DebugCollectionPage').then((module) => ({
    default: module.DebugCollectionPage,
  })),
);
const DebugCompanionsPage = lazy(() =>
  import('../pages/DebugCompanionsPage').then((module) => ({
    default: module.DebugCompanionsPage,
  })),
);
const DebugReleasePage = lazy(() =>
  import('../pages/DebugReleasePage').then((module) => ({
    default: module.DebugReleasePage,
  })),
);
const DebugAudioPage = lazy(() =>
  import('../pages/DebugAudioPage').then((module) => ({
    default: module.DebugAudioPage,
  })),
);
const DebugRewardPage = lazy(() =>
  import('../pages/DebugRewardPage').then((module) => ({
    default: module.DebugRewardPage,
  })),
);
const DebugStoryPage = lazy(() =>
  import('../pages/DebugStoryPage').then((module) => ({
    default: module.DebugStoryPage,
  })),
);
const DebugAssetsPage = lazy(() =>
  import('../pages/DebugAssetsPage').then((module) => ({
    default: module.DebugAssetsPage,
  })),
);

function resolveRoute(pathname: string): ReactNode {
  switch (pathname) {
    case '/':
      return <TitlePage />;
    case '/home':
      return <HomePage />;
    case '/world':
      return <WorldPage />;
    case '/mission':
      return <MissionPage />;
    case '/battle':
      return <BattlePage />;
    case '/result':
      return <ResultPage />;
    case '/collection':
      return <CollectionPage />;
    case '/collection/words':
      return <CollectionPage initialTab="words" />;
    case '/collection/companions':
      return <CollectionPage initialTab="companions" />;
    case '/collection/enemies':
      return <CollectionPage initialTab="enemies" />;
    case '/collection/album':
      return <CollectionPage initialTab="album" />;
    case '/collection/story':
      return <CollectionPage initialTab="story" />;
    case '/companions':
      return <CompanionsPage />;
    case '/equipment':
      return <EquipmentPage />;
    case '/shop':
      return <ShopPage />;
    case '/parent':
      return <ParentPage />;
    case '/parent/overview':
      return <ParentPage initialTab="overview" />;
    case '/parent/weak-letters':
      return <ParentPage initialTab="weak" />;
    case '/parent/speed':
      return <ParentPage initialTab="speed" />;
    case '/parent/history':
      return <ParentPage initialTab="history" />;
    case '/parent/settings':
      return <ParentPage initialTab="settings" />;
    case '/parent/backup':
      return <ParentPage initialTab="backup" />;
    case '/settings':
      return <SettingsPage />;
    case '/debug/data':
      return import.meta.env.DEV ? <DebugDataPage /> : <NotFoundPage />;
    case '/debug/content':
      return import.meta.env.DEV ? <DebugContentPage /> : <NotFoundPage />;
    case '/debug/learning':
      return import.meta.env.DEV ? <DebugLearningPage /> : <NotFoundPage />;
    case '/debug/missions':
      return import.meta.env.DEV ? <DebugMissionsPage /> : <NotFoundPage />;
    case '/debug/battle':
      return import.meta.env.DEV ? <DebugBattlePage /> : <NotFoundPage />;
    case '/debug/boss':
      return import.meta.env.DEV ? <DebugBossPage /> : <NotFoundPage />;
    case '/debug/world':
      return import.meta.env.DEV ? <DebugWorldPage /> : <NotFoundPage />;
    case '/debug/collection':
      return import.meta.env.DEV ? <DebugCollectionPage /> : <NotFoundPage />;
    case '/debug/companions':
      return import.meta.env.DEV ? <DebugCompanionsPage /> : <NotFoundPage />;
    case '/debug/release':
      return import.meta.env.DEV ? <DebugReleasePage /> : <NotFoundPage />;
    case '/debug/audio':
      return import.meta.env.DEV ? <DebugAudioPage /> : <NotFoundPage />;
    case '/debug/reward':
      return import.meta.env.DEV ? <DebugRewardPage /> : <NotFoundPage />;
    case '/debug/story':
      return import.meta.env.DEV ? <DebugStoryPage /> : <NotFoundPage />;
    case '/debug/assets':
      return import.meta.env.DEV ? <DebugAssetsPage /> : <NotFoundPage />;
    default:
      return <NotFoundPage />;
  }
}

export function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/index.html') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          animate="enter"
          className="h-full"
          exit="exit"
          initial="initial"
          variants={pageTransition}
        >
          <Suspense fallback={<LoadingScreen />}>
            {resolveRoute(location.pathname)}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
