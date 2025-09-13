import { ConfigProvider } from '@arcblock/ux/lib/Config';
import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import withTracker from '@arcblock/ux/lib/withTracker';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AdminLayout from './components/layout/admin-layout';
import PrivateRoute from './components/private-route';
import { SessionProvider } from './contexts/session';
import { appThemeOptions } from './libs/theme';
import { translations } from './locales';
import AdminDashboard from './pages/admin';
import ProjectsManagement from './pages/admin/projects';
import CreateProject from './pages/admin/projects/create';
import EditProject from './pages/admin/projects/edit';
import DynamicApp from './pages/app';
import Projects from './pages/app/projects';
import LoginPage from './pages/login';

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
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout title="" />
              </PrivateRoute>
            }>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/:projectId/edit" element={<EditProject />} />
          </Route>

          <Route path="/:slug" element={<DynamicApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
