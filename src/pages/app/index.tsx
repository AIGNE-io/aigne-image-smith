import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../libs/api';
import ProjectTemplate from './project-template';

interface AIProject {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  promptTemplate: string;
  uiConfig?: Record<string, any>;
  status: 'active' | 'draft' | 'archived';
  logoUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ProjectI18nContent {
  ui: {
    title: string;
    subtitle?: string;
    uploadButton: string;
    processButton: string;
    downloadButton: string;
    uploadPlaceholder?: string;
    processingText?: string;
    successText?: string;
    errorText?: string;
    tryAgainButton?: string;
    backButton?: string;
    historyButton?: string;
    creditsText?: string;
  };
  features?: string[];
  instructions?: string[];
  tips?: string[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  custom?: Record<string, any>;
}

export default function DynamicApp() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<AIProject | null>(null);
  const [i18nContent, setI18nContent] = useState<ProjectI18nContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('项目ID不能为空');
      setLoading(false);
      return;
    }

    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load project info and i18n content in parallel
        const [projectResponse, i18nResponse] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/i18n/zh`).catch(() => ({ data: { success: false } })),
        ]);

        if (!projectResponse.data.success) {
          throw new Error('项目不存在或已被禁用');
        }

        setProject(projectResponse.data.data);

        // Set i18n content if available
        if (i18nResponse.data.success) {
          setI18nContent(i18nResponse.data.data.content);
        } else {
          // Provide default i18n content if none configured
          setI18nContent({
            ui: {
              title: projectResponse.data.data.name.zh || projectResponse.data.data.name.en,
              subtitle: projectResponse.data.data.description.zh || projectResponse.data.data.description.en,
              uploadButton: '上传图片',
              processButton: '开始处理',
              downloadButton: '下载结果',
              uploadPlaceholder: '点击或拖拽图片到这里',
              processingText: '处理中，请稍候...',
              successText: '处理完成！',
              errorText: '处理失败',
              tryAgainButton: '重试',
              backButton: '返回',
              historyButton: '历史记录',
              creditsText: '剩余积分',
            },
          });
        }
      } catch (err) {
        console.error('Load project data error:', err);
        setError(err instanceof Error ? err.message : '加载项目信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project || !i18nContent) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || '项目信息加载失败'}</Alert>
      </Container>
    );
  }

  return <ProjectTemplate project={project} projectId={projectId!} />;
}
