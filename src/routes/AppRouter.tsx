import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { LoadingScreen } from '../components/LoadingScreen';
import { pageTransition } from '../utils/motion';
import { BattlePage } from '../pages/BattlePage';
import { HomePage } from '../pages/HomePage';
import { MissionPage } from '../pages/MissionPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ParentPage } from '../pages/ParentPage';
import { ResultPage } from '../pages/ResultPage';
import { SettingsPage } from '../pages/SettingsPage';
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

export function AppRouter() {
  const location = useLocation();

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
            <Routes location={location}>
              <Route element={<TitlePage />} path="/" />
              <Route element={<HomePage />} path="/home" />
              <Route element={<WorldPage />} path="/world" />
              <Route element={<MissionPage />} path="/mission" />
              <Route element={<BattlePage />} path="/battle" />
              <Route element={<ResultPage />} path="/result" />
              <Route element={<CollectionPage />} path="/collection" />
              <Route
                element={<CollectionPage initialTab="words" />}
                path="/collection/words"
              />
              <Route
                element={<CollectionPage initialTab="companions" />}
                path="/collection/companions"
              />
              <Route
                element={<CollectionPage initialTab="enemies" />}
                path="/collection/enemies"
              />
              <Route
                element={<CollectionPage initialTab="album" />}
                path="/collection/album"
              />
              <Route element={<CompanionsPage />} path="/companions" />
              <Route element={<EquipmentPage />} path="/equipment" />
              <Route element={<ShopPage />} path="/shop" />
              <Route element={<ParentPage />} path="/parent" />
              <Route element={<SettingsPage />} path="/settings" />
              {import.meta.env.DEV ? (
                <>
                  <Route element={<DebugDataPage />} path="/debug/data" />
                  <Route element={<DebugContentPage />} path="/debug/content" />
                  <Route
                    element={<DebugLearningPage />}
                    path="/debug/learning"
                  />
                  <Route
                    element={<DebugMissionsPage />}
                    path="/debug/missions"
                  />
                  <Route element={<DebugBattlePage />} path="/debug/battle" />
                  <Route element={<DebugWorldPage />} path="/debug/world" />
                  <Route
                    element={<DebugCollectionPage />}
                    path="/debug/collection"
                  />
                </>
              ) : null}
              <Route element={<Navigate replace to="/" />} path="/index.html" />
              <Route element={<NotFoundPage />} path="*" />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
