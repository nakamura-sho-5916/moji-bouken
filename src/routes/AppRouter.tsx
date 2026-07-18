import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
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
import { WorldPage } from '../pages/WorldPage';
import { DebugDataPage } from '../pages/DebugDataPage';

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
              <Route element={<DebugDataPage />} path="/debug/data" />
            ) : null}
            <Route element={<Navigate replace to="/" />} path="/index.html" />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
