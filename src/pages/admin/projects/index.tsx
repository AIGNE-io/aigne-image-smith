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

const statusLabels = {
  active: '活跃',
  draft: '草稿',
  archived: '已归档',
} as const;

export default function ProjectsManagement() {
  const { session } = useSessionContext();
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/projects/admin/all');
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError('获取项目列表失败');
      }
    } catch (err) {
      console.error('Load projects error:', err);
      setError(err instanceof Error ? err.message : '获取项目列表失败');
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
        setError('更新项目状态失败');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError(err instanceof Error ? err.message : '更新项目状态失败');
    }
  };

  const getLocalizedText = (obj: Record<string, string>, locale = 'zh') => {
    return obj[locale] || obj.en || obj[Object.keys(obj)[0] || 'en'] || '';
  };

  if (!session?.user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">请先登录以访问管理后台</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          项目管理
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/admin/projects/create">
          创建项目
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
              <TableCell>项目名称</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell align="right">操作</TableCell>
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
                <TableCell>
                  <Typography variant="body2">{new Date(project.createdAt).toLocaleDateString('zh-CN')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    {project.status !== 'archived' && (
                      <Tooltip title="编辑项目">
                        <IconButton size="small" component={Link} to={`/admin/projects/${project.id}/edit`}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {project.status === 'archived' ? (
                      <Tooltip title="恢复项目">
                        <IconButton size="small" onClick={() => handleStatusChange(project.id, 'active')}>
                          <UnarchiveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="归档项目">
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
            暂无项目
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/admin/projects/create">
            创建第一个项目
          </Button>
        </Box>
      )}
    </Container>
  );
}
