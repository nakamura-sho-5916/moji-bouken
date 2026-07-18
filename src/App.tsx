import { BrowserRouter } from 'react-router-dom';
import { AppInitializer } from './components/AppInitializer';
import { AppRouter } from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <AppRouter />
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
