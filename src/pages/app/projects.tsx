// @ts-nocheck
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Box, Card, CardContent, CardMedia, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../libs/api';
import { getImageUrl } from '../../libs/utils';

interface AIProject {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  subtitle?: Record<string, string>;
  uiConfig?: {
    primaryColor?: string;
    accentColor?: string;
    category?: string;
  };
  logoUrl?: string;
  coverUrl?: string;
  seoImageUrl?: string | null;
  createdAt: string;
}

export default function Projects() {
  const { t, locale } = useLocaleContext();
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/api/projects', {
          params: { locale },
        });
        if (response.data.success) {
          setProjects([...response.data.data, ...response.data.data, ...response.data.data, ...response.data.data]);
        }
      } catch (error) {
        console.error('Load projects error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [locale]);

  const getLocalizedText = (obj: Record<string, string>) => {
    return obj[locale] || obj.en || obj[Object.keys(obj)[0] || 'en'] || '';
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}>
        <Typography variant="h6" color="text.secondary">
          {t('projects.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Simple Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', py: 6 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}>
              {t('projects.title')}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontSize: '1.25rem' }}>
              {t('projects.subtitle')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Apps Grid */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {projects.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              {t('projects.noProjects')}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t('projects.comingSoon')}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              maxWidth: '1280px',
              mx: 'auto',
            }}>
            {projects.map((project) => (
              <Link key={project.id} to={`/${project.slug}`} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'grey.300',
                    boxShadow: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      borderColor: 'grey.400',
                    },
                  }}>
                  {/* Image */}
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: 'grey.100',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                    {project.seoImageUrl || project.coverUrl || project.logoUrl ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={getImageUrl(project.seoImageUrl || project.coverUrl || project.logoUrl)}
                        alt={getLocalizedText(project.name)}
                        sx={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
                          color: 'text.secondary',
                        }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            textAlign: 'center',
                            px: 2,
                          }}>
                          {getLocalizedText(project.name)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      height: '120px', // Fixed content area height
                    }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '3.08rem', // Exact 2-line height (1.1rem * 1.4 * 2)
                        minHeight: '3.08rem', // Ensure minimum height
                      }}>
                      {getLocalizedText(project.name)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.5,
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '2.625rem', // Exact 2-line height (0.875rem * 1.5 * 2)
                        minHeight: '2.625rem', // Ensure minimum height
                        flex: 1, // Take remaining space
                      }}>
                      {project.subtitle ? getLocalizedText(project.subtitle) : getLocalizedText(project.description)}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
