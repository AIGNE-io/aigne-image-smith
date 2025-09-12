import { useEffect, useState } from 'react';

import api from '../libs/api';

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

interface UseProjectI18nResult {
  content: ProjectI18nContent | null;
  loading: boolean;
  error: string | null;
  locale: string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
}

const defaultI18nContent: ProjectI18nContent = {
  ui: {
    title: 'AI 图片处理',
    subtitle: '使用AI技术处理您的图片',
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
  features: ['AI智能处理', '高质量输出', '快速生成'],
  instructions: ['选择图片', '点击处理', '下载结果'],
};

function useProjectI18n(projectId: string, initialLocale: string = 'zh'): UseProjectI18nResult {
  const [content, setContent] = useState<ProjectI18nContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState(initialLocale);
  const [availableLocales] = useState<string[]>(['zh', 'en']);

  useEffect(() => {
    if (!projectId) {
      setError('项目ID不能为空');
      setLoading(false);
      return;
    }

    const loadI18nContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load the specific locale
        const response = await api.get(`/projects/${projectId}/i18n/${locale}`);

        if (response.data.success) {
          setContent(response.data.data.content);
        } else {
          // Fallback to default content if no i18n configuration found
          setContent(defaultI18nContent);
        }
      } catch (err) {
        console.error('Load i18n content error:', err);
        // Use default content as fallback
        setContent(defaultI18nContent);
        setError(null); // Don't show error for missing i18n, just use default
      } finally {
        setLoading(false);
      }
    };

    loadI18nContent();
  }, [projectId, locale]);

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    // Save to localStorage for persistence
    localStorage.setItem('preferred-locale', newLocale);
  };

  return {
    content,
    loading,
    error,
    locale,
    setLocale: handleSetLocale,
    availableLocales,
  };
}

export default useProjectI18n;
