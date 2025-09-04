import { ConfigProvider } from '@arcblock/ux/lib/Config';
import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import withTracker from '@arcblock/ux/lib/withTracker';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import { SessionProvider } from './contexts/session';
import { appThemeOptions } from './libs/theme';
import { translations } from './locales';
import Home from './pages/home';

const fallback = (
  <Box
    className="fallback-container"
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={window.location.reload}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </LocalizationProvider>
      </ErrorBoundary>
    </Suspense>
  );
}

const TrackedApp = withTracker(App);

export default function WrappedApp() {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';

  return (
    // @ts-ignore
    <ConfigProvider theme={appThemeOptions} translations={translations}>
      <SessionProvider serviceHost={basename}>
        <Router basename={basename}>
          <TrackedApp />
        </Router>
      </SessionProvider>
    </ConfigProvider>
  );
}
