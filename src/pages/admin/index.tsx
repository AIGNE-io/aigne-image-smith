import { Launch as LaunchIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          PixLoom 管理后台
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理您的 AI 图片应用项目
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
                项目管理
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                创建、编辑和管理您的 AI 图片应用项目
              </Typography>
              <Button variant="contained" endIcon={<LaunchIcon />} component={Link} to="/admin/projects" fullWidth>
                进入管理
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
                快速创建
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                快速创建一个新的 AI 图片应用项目
              </Typography>
              <Button
                variant="outlined"
                endIcon={<LaunchIcon />}
                component={Link}
                to="/admin/projects/create"
                fullWidth>
                创建项目
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
                预览应用
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                查看用户看到的应用列表页面
              </Typography>
              <Button variant="outlined" endIcon={<LaunchIcon />} component={Link} to="/" target="_blank" fullWidth>
                查看应用
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
