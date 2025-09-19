import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { t } = useLocaleContext();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('admin.dashboard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.dashboard.subtitle')}
        </Typography>
      </Box>

      {/* @ts-ignore */}
      <Grid container spacing={3}>
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('admin.dashboard.projectManagement.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('admin.dashboard.projectManagement.description')}
              </Typography>
              <Button variant="contained" endIcon={<LaunchIcon />} component={Link} to="/admin/projects" fullWidth>
                {t('admin.dashboard.projectManagement.action')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('admin.dashboard.quickCreate.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('admin.dashboard.quickCreate.description')}
              </Typography>
              <Button
                variant="outlined"
                endIcon={<LaunchIcon />}
                component={Link}
                to="/admin/projects/create"
                fullWidth>
                {t('admin.dashboard.quickCreate.action')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('admin.dashboard.previewApp.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('admin.dashboard.previewApp.description')}
              </Typography>
              <Button variant="outlined" endIcon={<LaunchIcon />} component={Link} to="/" target="_blank" fullWidth>
                {t('admin.dashboard.previewApp.action')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
