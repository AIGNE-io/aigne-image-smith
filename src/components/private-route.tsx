import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useSessionContext } from '../contexts/session';

function PrivateRoute({ children }: any) {
  const { t } = useLocaleContext();
  const { session } = useSessionContext();
  const loggedIn = useRef(!!session.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      if (!['owner', 'admin'].includes(session?.user?.role)) {
        session.logout();
        navigate('/login');
        Toast.error(t('common.permissions.no'));
      }
    } else {
      session.login(() => {
        navigate('/admin/home');
      });
    }
  }, [session]);

  if (session.loading) {
    return <CircularProgress />;
  }

  // 注意不能直接使用 session 状态判断登录状态, 需要借助 ref, 否则退出登录时 session 状态变化 (变为未登录状态) 会导致 re-render 并执行 if 内的逻辑
  if (!loggedIn.current) {
    return <Navigate to={{ pathname: '/login' }} />;
  }

  return children;
}

export default PrivateRoute;
