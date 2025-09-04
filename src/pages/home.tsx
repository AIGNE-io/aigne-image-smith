import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSessionContext } from '../contexts/session';

export default function Home() {
  return <div>Welcome to PixLoom</div>;
}
