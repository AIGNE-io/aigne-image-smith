import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  Edit as EditIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSessionContext } from '../../../contexts/session';
import api from '../../../libs/api';

interface AIProject {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  promptTemplate: string;
  uiConfig?: Record<string, any>;
  status: 'active' | 'draft' | 'archived';
  usageCount?: number;
  logoUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
} as const;

const getStatusLabels = (t: any) => ({
  active: t('admin.projects.status.active'),
  draft: t('admin.projects.status.draft'),
  archived: t('admin.projects.status.archived'),
});

export default function ProjectsManagement() {
  const { t } = useLocaleContext();
  const { session } = useSessionContext();
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statusLabels = getStatusLabels(t);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/projects/admin/all');
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError(t('admin.projects.error.loadFailed'));
      }
    } catch (err) {
      console.error('Load projects error:', err);
      setError(err instanceof Error ? err.message : t('admin.projects.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadProjects();
    }
  }, [session?.user]);

  const handleStatusChange = async (projectId: string, newStatus: 'active' | 'draft' | 'archived') => {
    try {
      const response = await api.patch(`/api/projects/admin/${projectId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        await loadProjects(); // Reload projects
      } else {
        setError(t('admin.projects.error.updateStatusFailed'));
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError(err instanceof Error ? err.message : t('admin.projects.error.updateStatusFailed'));
    }
  };

  const getLocalizedText = (obj: Record<string, string>, locale = 'zh') => {
    return obj[locale] || obj.en || obj[Object.keys(obj)[0] || 'en'] || '';
  };

  if (!session?.user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{t('admin.projects.error.loginRequired')}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{t('admin.projects.loading')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('admin.projects.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/admin/projects/create">
          {t('admin.projects.createProject')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.projects.table.name')}</TableCell>
              <TableCell>{t('admin.projects.table.slug')}</TableCell>
              <TableCell>{t('admin.projects.table.status')}</TableCell>
              <TableCell align="center">{t('admin.projects.table.usageCount')}</TableCell>
              <TableCell>{t('admin.projects.table.createdAt')}</TableCell>
              <TableCell align="right">{t('admin.projects.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{getLocalizedText(project.name)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    }}
                    onClick={() => {
                      const basename = window?.blocklet?.prefix || '/';
                      const previewUrl = basename === '/' ? `/${project.slug}` : `${basename}${project.slug}`;
                      window.open(previewUrl, '_blank');
                    }}>
                    {project.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={statusLabels[project.status]} color={statusColors[project.status]} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {project.usageCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(project.createdAt).toLocaleDateString('zh-CN')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    {project.status !== 'archived' && (
                      <Tooltip title={t('admin.projects.actions.edit')}>
                        <IconButton size="small" component={Link} to={`/admin/projects/${project.id}/edit`}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {project.status === 'archived' ? (
                      <Tooltip title={t('admin.projects.actions.restore')}>
                        <IconButton size="small" onClick={() => handleStatusChange(project.id, 'active')}>
                          <UnarchiveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('admin.projects.actions.archive')}>
                        <IconButton size="small" onClick={() => handleStatusChange(project.id, 'archived')}>
                          <ArchiveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {projects.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            {t('admin.projects.empty.title')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/admin/projects/create">
            {t('admin.projects.empty.description')}
          </Button>
        </Box>
      )}
    </Container>
  );
}
