// @ts-nocheck
import { Launch as LaunchIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import api from '../../libs/api';

interface AIProject {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  uiConfig?: Record<string, any>;
  logoUrl?: string;
  createdAt: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects');
        if (response.data.success) {
          setProjects(response.data.data);
        }
      } catch (error) {
        console.error('Load projects error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const getLocalizedText = (obj: Record<string, string>, locale = 'zh') => {
    return obj[locale] || obj.en || obj[Object.keys(obj)[0] || 'en'] || '';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading projects...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom>
            PixLoom AI 图片应用
          </Typography>
          <Typography variant="h6">选择一个应用开始使用 AI 图片处理功能</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {projects.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              暂无可用的应用
            </Typography>
            <Typography color="text.secondary">请联系管理员创建应用</Typography>
          </Box>
        ) : (
          <Grid item container spacing={4}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}>
                  {project.logoUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={project.logoUrl}
                      alt={getLocalizedText(project.name)}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      sx={{
                        color: project.uiConfig?.primaryColor || 'text.primary',
                      }}>
                      {getLocalizedText(project.name)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {getLocalizedText(project.description)}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<LaunchIcon />}
                      onClick={() => window.open(`/${project.id}`, '_self')}
                      sx={{
                        bgcolor: project.uiConfig?.primaryColor || 'primary.main',
                        '&:hover': {
                          bgcolor: project.uiConfig?.primaryColor || 'primary.dark',
                        },
                      }}>
                      开始使用
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
