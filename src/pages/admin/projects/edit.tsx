// @ts-nocheck
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ProjectContentEditor, {
  ProjectContentData,
  SUPPORTED_LANGUAGES,
} from '../../../components/project-content-editor';
import { ControlsConfigEditor, ProjectControlsConfig } from '../../../components/project-controls';
import UploaderProvider from '../../../components/uploader';
import api from '../../../libs/api';

interface AIProject {
  id: string;
  name: Record<string, string>;
  subtitle?: Record<string, string>;
  description: Record<string, string>;
  seoImageUrl?: Record<string, string>;
  promptTemplate: string;
  uiConfig?: Record<string, any>;
  controlsConfig?: ProjectControlsConfig;
  status: 'active' | 'draft' | 'archived';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  slug: string;
  content: ProjectContentData;
  promptTemplate: string;
  uiConfig: {
    layout: string;
    features: {
      uploadMultiple: boolean;
      showComparisonSlider: boolean;
    };
  };
  controlsConfig: ProjectControlsConfig;
}

// Initialize empty values for all supported languages
const createEmptyLanguageObject = () => {
  const obj: Record<string, string> = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    obj[lang.code] = '';
  });
  return obj;
};

const defaultFormData: ProjectFormData = {
  slug: '',
  content: {
    name: createEmptyLanguageObject(),
    subtitle: createEmptyLanguageObject(),
    description: createEmptyLanguageObject(),
    seoImageUrl: createEmptyLanguageObject(),
  },
  promptTemplate: '',
  uiConfig: {
    layout: 'card',
    features: {
      uploadMultiple: false,
      showComparisonSlider: true,
    },
  },
  controlsConfig: {
    inputConfig: {
      maxImages: 1,
      requirements: '',
    },
    controlsConfig: [],
  },
};

function EditProjectContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<AIProject | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('项目ID不能为空');
      setInitialLoading(false);
      return;
    }

    const loadProject = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/api/projects/${projectId}`);

        if (response.data.success) {
          const projectData = response.data.data;
          setProject(projectData);

          // Populate form data with all supported languages
          const nameData = createEmptyLanguageObject();
          const subtitleData = createEmptyLanguageObject();
          const descData = createEmptyLanguageObject();
          const seoImageData = createEmptyLanguageObject();

          // Fill with existing data
          Object.keys(projectData.name || {}).forEach((lang) => {
            nameData[lang] = projectData.name[lang] || '';
          });
          Object.keys(projectData.subtitle || {}).forEach((lang) => {
            subtitleData[lang] = projectData.subtitle[lang] || '';
          });
          Object.keys(projectData.description || {}).forEach((lang) => {
            descData[lang] = projectData.description[lang] || '';
          });
          Object.keys(projectData.seoImageUrl || {}).forEach((lang) => {
            seoImageData[lang] = projectData.seoImageUrl[lang] || '';
          });

          setFormData({
            slug: projectData.slug || '',
            content: {
              name: nameData,
              subtitle: subtitleData,
              description: descData,
              seoImageUrl: seoImageData,
            },
            promptTemplate: projectData.promptTemplate || '',
            uiConfig: {
              layout: projectData.uiConfig?.layout || 'card',
              features: {
                uploadMultiple: projectData.uiConfig?.features?.uploadMultiple || false,
                showComparisonSlider: projectData.uiConfig?.features?.showComparisonSlider !== false,
              },
            },
            controlsConfig: projectData.controlsConfig || {
              inputConfig: {
                maxImages: 1,
                requirements: '',
              },
              controlsConfig: [],
            },
          });
        } else {
          setError('项目不存在或已被禁用');
        }
      } catch (err) {
        console.error('Load project error:', err);
        setError(err instanceof Error ? err.message : '加载项目失败');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasCompleteLanguage = SUPPORTED_LANGUAGES.some((lang) => {
      return (
        formData.content.name[lang.code]?.trim() &&
        formData.content.subtitle[lang.code]?.trim() &&
        formData.content.description[lang.code]?.trim() &&
        formData.content.seoImageUrl[lang.code]?.trim()
      );
    });

    if (!projectId || !formData.slug.trim() || !hasCompleteLanguage || !formData.promptTemplate.trim()) {
      setError(
        '请填写项目slug、至少完整填写一种语言的所有信息（项目名称、副标题、描述、OpenGraph图片URL）和AI提示词模板',
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/api/projects/admin/${projectId}`, {
        slug: formData.slug,
        name: formData.content.name,
        subtitle: formData.content.subtitle,
        description: formData.content.description,
        seoImageUrl: formData.content.seoImageUrl,
        promptTemplate: formData.promptTemplate,
        uiConfig: formData.uiConfig,
        controlsConfig: formData.controlsConfig,
      });

      if (response.data.success) {
        navigate('/admin/projects');
      } else {
        setError('更新项目失败');
      }
    } catch (err) {
      console.error('Update project error:', err);
      setError(err instanceof Error ? err.message : '更新项目失败');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  if (error && !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton component={Link} to="/admin/projects" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            编辑项目
          </Typography>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* 页面标题 */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton component={Link} to="/admin/projects" sx={{ mr: 2, p: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          编辑项目:{' '}
          {project?.name.zh ||
            project?.name.zh ||
            project?.name.en ||
            Object.values(project?.name || {})[0] ||
            projectId}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* 项目Slug */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 3 }}>
                项目URL路径 <span style={{ color: '#f44336', marginLeft: 4 }}>*</span>
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="my-awesome-project"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value,
                  })
                }
                disabled={loading}
                helperText="项目的URL路径标识符，只能包含小写字母、数字和短横线"
                error={!formData.slug.trim()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.8rem',
                    marginTop: 1.5,
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* 项目基本信息 */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <ProjectContentEditor
                values={formData.content}
                onChange={(values) => setFormData({ ...formData, content: values })}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* AI 提示词模板 */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 3 }}>
                AI 提示词模板 <span style={{ color: '#f44336', marginLeft: 4 }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                required
                placeholder="请输入用于AI图片处理的提示词模板，支持变量替换..."
                value={formData.promptTemplate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promptTemplate: e.target.value,
                  })
                }
                disabled={loading}
                helperText="这将作为AI处理图片时的基础提示词"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.8rem',
                    marginTop: 1.5,
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* 控制组件配置 */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 3 }}>
                输入与控制配置
              </Typography>
              <ControlsConfigEditor
                config={formData.controlsConfig}
                onChange={(controlsConfig) => setFormData({ ...formData, controlsConfig })}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* 功能配置 */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 3 }}>
                UI 功能配置
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.uiConfig.features.showComparisonSlider}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            uiConfig: {
                              ...formData.uiConfig,
                              features: {
                                ...formData.uiConfig.features,
                                showComparisonSlider: e.target.checked,
                              },
                            },
                          })
                        }
                        disabled={loading}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          显示对比滑块
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          在处理结果页面显示前后对比滑块
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ p: 2, fontSize: '0.95rem' }}>
              {error}
            </Alert>
          )}

          {/* 操作按钮 */}
          <Card elevation={1}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="flex-end" gap={3}>
                <Button
                  component={Link}
                  to="/admin/projects"
                  disabled={loading}
                  variant="outlined"
                  size="large"
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
                  {loading ? '保存中...' : '保存更改'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </form>
    </Container>
  );
}

export default function EditProject() {
  return (
    <UploaderProvider>
      <EditProjectContent />
    </UploaderProvider>
  );
}
