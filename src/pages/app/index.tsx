import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../libs/api';
import AIProjectHome from '../ai-project-home';

interface AIProject {
  id: string;
  slug: string;
  name: Record<string, string>;
  subtitle: Record<string, string>;
  description: Record<string, string>;
  promptTemplate: string;
  uiConfig?: Record<string, any>;
  controlsConfig?: Record<string, any>;
  status: 'active' | 'draft' | 'archived';
  metadata?: Record<string, any>;
  createdAt: string;
}

export default function DynamicApp() {
  const { locale } = useLocaleContext();
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<AIProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('项目路径不能为空');
      setLoading(false);
      return;
    }

    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load project info and i18n content in parallel
        const [projectResponse] = await Promise.all([api.get(`/api/projects/by-slug/${slug}`)]);
        if (!projectResponse.data.success) {
          throw new Error('项目不存在或已被禁用');
        }
        setProject(projectResponse.data.data);
      } catch (err) {
        console.error('Load project data error:', err);
        setError(err instanceof Error ? err.message : '加载项目信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [slug]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || '项目信息加载失败'}</Alert>
      </Container>
    );
  }

  // 转换项目数据为AIProjectHome的配置格式
  const getLocalizedText = (obj: Record<string, string> | undefined, fallback = '') => {
    if (!obj || typeof obj !== 'object') return fallback;

    // 优先使用当前语言环境
    if (obj[locale]) return obj[locale];

    // 定义语言回退顺序
    const fallbackOrder = ['zh', 'en', 'zh-tw', 'ja'];

    // 按顺序查找可用的语言版本
    for (const lang of fallbackOrder) {
      if (obj[lang]) return obj[lang];
    }

    // 如果以上都没有，使用第一个可用的值
    const keys = Object.keys(obj);
    return keys.length > 0 && keys[0] && obj[keys[0]] ? obj[keys[0]] : fallback;
  };

  const config = {
    clientId: project.id, // 使用项目ID作为clientId
    title: getLocalizedText(project.name, '') || '',
    subtitle: getLocalizedText(project.subtitle, '') || '',
    description: getLocalizedText(project.description, '') || '',
    prompt: project.promptTemplate || '',
    uiConfig: project.uiConfig || {
      layout: 'card',
      features: {
        uploadMultiple: false,
        showComparisonSlider: true,
      },
    },
    controlsConfig: project.controlsConfig || {
      inputConfig: {
        imageSize: 1,
        requirements: '',
      },
      controlsConfig: [],
    },
  };

  return <AIProjectHome config={config} />;
}
