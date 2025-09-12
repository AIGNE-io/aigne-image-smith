import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSessionContext } from '../contexts/session';

export default function Login() {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state?.from?.pathname || window?.blocklet?.prefix || '/';

  useEffect(() => {
    if (session?.user) {
      navigate(origin);
    } else {
      session.login(() => navigate(origin));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user]);

  if (session.loading) {
    return <CircularProgress />;
  }
  return null;
}
