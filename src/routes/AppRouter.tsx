import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { LoadingScreen } from '../components/LoadingScreen';
import { pageTransition } from '../utils/motion';
import { BattlePage } from '../pages/BattlePage';
import { CollectionPage } from '../pages/CollectionPage';
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
