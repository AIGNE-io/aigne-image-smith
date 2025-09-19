import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PaletteIcon from '@mui/icons-material/Palette';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Typography,
  keyframes,
  styled,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FacebookIcon, FacebookShareButton, TwitterShareButton, XIcon } from 'react-share';

import { useSessionContext } from '../contexts/session';
import api from '../libs/api';
import { formatBalance, getCreditPage, getImageUrl } from '../libs/utils';
import { useSubscription } from '../libs/ws';
import { MultiImageUploader } from './multi-image-uploader';
import {
  BackgroundSelectorControlConfig,
  ControlValues,
  ProjectControls,
  ProjectControlsConfig,
} from './project-controls';
import { TextInput } from './text-input';
import UploaderProvider from './uploader';

// 动画效果
const sparkleAnimation = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`;

// 样式组件
const VintageCard = styled(Paper)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${theme.palette.divider}, transparent)`,
  },
}));

const ImageCompareContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '900px',
  margin: '0 auto',
  borderRadius: '24px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[8],
  border: `2px solid ${theme.palette.divider}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, transparent 30%, ${theme.palette.action.hover} 50%, transparent 70%)`,
    pointerEvents: 'none',
  },
}));

const CompareImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
});

const ImageWrapper = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GoldenButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  padding: '12px 32px',
  borderRadius: '50px',
  textTransform: 'none',
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  message: string;
}

interface CreditInfo {
  balance: number;
  isNewUser: boolean;
}

interface GeneratedImage {
  id: string;
  originalImg: string;
  generatedImg: string;
  status: string;
  creditsConsumed: number;
  processingTimeMs: number;
  createdAt: string;
}

interface HistoryPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface AIProjectConfig {
  clientId: string;
  title: string;
  subtitle: string;
  description: string;
  uiConfig?: {
    layout?: string;
    features?: {
      uploadMultiple?: boolean;
      showComparisonSlider?: boolean;
    };
  };
  controlsConfig?: ProjectControlsConfig;
}

interface AIProjectHomeProps {
  config: AIProjectConfig;
}

function AIProjectHomeComponent({ config }: AIProjectHomeProps) {
  const { t, locale } = useLocaleContext();
  const { session } = useSessionContext();
  const theme = useTheme();
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [processingText, setProcessingText] = useState<string>(''); // 存储正在处理的文本内容
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [controlValues, setControlValues] = useState<ControlValues>({});
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [decimal, setDecimal] = useState<number>(2);
  const [processing, setProcessing] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    message: '',
  });
  const [compareSlider, setCompareSlider] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [generatedHistory, setGeneratedHistory] = useState<GeneratedImage[]>([]);
  const [historyPagination, setHistoryPagination] = useState<HistoryPagination>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkBalanceSuccess, setCheckBalanceSuccess] = useState(false);
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    balance: 0,
    isNewUser: false,
  });
  const [showWelcomeGift, setShowWelcomeGift] = useState(false);
  const [viewImageDialog, setViewImageDialog] = useState<{ open: boolean; imageUrl: string | null }>({
    open: false,
    imageUrl: null,
  });
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; itemId: string | null }>({
    open: false,
    itemId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const shareMenuOpen = Boolean(shareAnchorEl);
  const isLoggedIn = session?.user;

  // 获取输入类型
  const inputType = config.controlsConfig?.inputConfig?.inputType || 'image';

  // 假进度条计时器引用
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useSubscription(
    session?.user?.did,
    async ({ event }) => {
      if (event === 'finish-payment') {
        await checkUserCredits();
      }
    },
    [session?.user?.did],
  );

  // 定义不同进度阶段的消息
  const getProgressMessage = (progress: number) => {
    if (progress < 10) return t('home.processing.analyzing');
    if (progress < 30) return t('home.processing.preparing');
    if (progress < 50) return t('home.processing.generating');
    if (progress < 70) return t('home.processing.enhancing');
    if (progress < 90) return t('home.processing.finalizing');
    return t('home.processing.almost');
  };

  // 启动假进度条 (25秒内从1%到99%)
  const startFakeProgress = useCallback(() => {
    const duration = 25000; // 25秒
    const startTime = Date.now();
    const startProgress = 1;
    const endProgress = 99;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(startProgress + ((endProgress - startProgress) * elapsed) / duration, endProgress);
      const roundedProgress = Math.round(progress);

      setProcessing((prev) => ({
        ...prev,
        progress: roundedProgress,
        message: getProgressMessage(roundedProgress),
      }));

      if (progress < endProgress && elapsed < duration) {
        progressTimerRef.current = setTimeout(updateProgress, 100); // 每100ms更新一次
      }
    };

    updateProgress();
  }, [getProgressMessage, t, locale]);

  // 停止假进度条
  const stopFakeProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // 获取历史记录数据
  const fetchHistoryData = useCallback(
    async (offset = 0, limit = 20) => {
      if (!isLoggedIn) return;

      try {
        setLoadingHistory(true);
        const { data } = await api.get('/api/ai/history', {
          params: { clientId: config.clientId, limit, offset },
        });

        if (data.success) {
          const historyData = data.data;

          if (offset === 0) {
            // 首次加载，替换所有数据
            setGeneratedHistory(historyData.generations);
          } else {
            // 加载更多，追加数据
            setGeneratedHistory((prev) => [...prev, ...historyData.generations]);
          }

          setHistoryPagination(historyData.pagination);
        }
      } catch (err) {
        console.error('获取历史记录失败:', err);
      } finally {
        setLoadingHistory(false);
      }
    },
    [isLoggedIn, config.clientId],
  );

  // 检查用户认证状态和Credit余额
  const checkUserCredits = useCallback(async () => {
    try {
      try {
        const { data } = await api.get('/api/payment/credits/balance');
        setCreditInfo({
          isNewUser: data.data.isNewUser,
          balance: Number(formatBalance(data.data.balance, data.data.paymentCurrency?.decimal)),
        });
        setCheckBalanceSuccess(true);
        setDecimal(data.data.paymentCurrency?.decimal || 2);
        if (data.data.isNewUser && isLoggedIn) {
          setShowWelcomeGift(true);
        }
      } catch (error) {
        // do nothing
      }
    } catch (err) {
      console.error('Failed to check credits:', err);
    }
  }, [isLoggedIn]);

  // 领取免费Credit
  const handleClaimFreeCredits = async () => {
    try {
      const { data } = await api.post('/api/payment/credits/grants');
      if (data.success) {
        checkUserCredits();
        setShowWelcomeGift(false);
        setError(null);
      } else {
        setError(data?.message || 'Failed to claim credits');
      }
    } catch (err) {
      console.error('Failed to claim credits:', err);
      setError(t('home.error.claimFailed'));
    }
  };

  // 组件加载时检查用户状态
  useEffect(() => {
    if (isLoggedIn) {
      checkUserCredits();
      fetchHistoryData(); // 获取历史记录
    }
  }, [checkUserCredits, fetchHistoryData, isLoggedIn]);

  // 初始化控件默认值
  useEffect(() => {
    if (config.controlsConfig?.controlsConfig && config.controlsConfig.controlsConfig.length > 0) {
      const defaultValues: ControlValues = {};
      config.controlsConfig.controlsConfig.forEach((control) => {
        if (control.defaultValue !== undefined) {
          defaultValues[control.key] = control.defaultValue;
        } else if (control.type === 'backgroundSelector') {
          // 特殊处理 backgroundSelector，如果没有默认值则使用第一个选项
          const bgControl = control as BackgroundSelectorControlConfig;
          if (bgControl.backgrounds && bgControl.backgrounds.length > 0) {
            defaultValues[control.key] = bgControl.backgrounds[0]?.value;
          }
        }
      });
      setControlValues(defaultValues);
    }
  }, [config.controlsConfig?.controlsConfig]);

  // 组件挂载时滚动到页面顶部，避免从其他页面跳转时保留滚动位置
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      stopFakeProgress();
    };
  }, [stopFakeProgress]);

  const createCheckout = useCallback(async () => {
    if (!session?.user) {
      return { success: false };
    }
    try {
      const { data } = await api.post('/api/payment/credits/checkout', { customerId: session?.user?.did });
      if (data?.success && data.data?.url) {
        // 跳转到支付页面
        const url = new URL(data.data.url);
        url.host = window.location.host;
        url.searchParams.set('redirect', window.location.href);
        window.location.href = url.toString();
        return { success: true, url: url.toString() };
      }
      const errorMsg = data.error || t('home.error.createOrderFailed');
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (err) {
      console.error('创建充值订单失败:', err);
      const errorMsg = t('home.error.createOrderError');
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [session?.user, t]);

  const handleCreateCheckout = async () => {
    try {
      setCreatingCheckout(true);
      const result = await createCheckout();
      if (!result?.success) {
        setError(result?.error || 'Create order fail!');
      }
    } catch (err) {
      setError('Create order fail!');
    } finally {
      setCreatingCheckout(false);
    }
  };

  // 统一的生成方法
  const generate = useCallback(
    async (options: { text?: string; images?: string[] } = {}) => {
      const { text, images = [] } = options;

      // 检查用户是否已认证
      if (!isLoggedIn) {
        setError(t('home.error.loginRequired'));
        return;
      }

      // 检查Credit余额是否充足
      const requiredCredits = 1;
      if (creditInfo.balance < requiredCredits) {
        setError(t('home.error.insufficientCredits'));
        return;
      }

      // 根据输入类型验证
      if (inputType === 'text') {
        if (!text || !text.trim()) {
          setError('请输入文本内容');
          return;
        }
        // 保存正在处理的文本内容
        setProcessingText(text);
      } else {
        if (images.length === 0) {
          setError(t('home.error.noImage'));
          return;
        }
        // 验证图片数量
        const imageSize = config.controlsConfig?.inputConfig.imageSize || 1;
        if (images.length < imageSize) {
          setError(`Exactly ${imageSize} image(s) required`);
          return;
        }
      }

      // 开始处理动画
      setProcessing({
        isProcessing: true,
        progress: 1,
        message: inputType === 'text' ? t('home.processing.analyzing') : t('home.processing.uploading'),
      });

      // 启动假进度条
      startFakeProgress();

      try {
        const { data } = await api.post('/api/ai/generate', {
          textInput: text || '',
          originalImages: images,
          clientId: config.clientId,
          controlValues,
          metadata: {
            controlValues,
            inputType,
            imageCount: images.length,
          },
        });

        if (!data.success) {
          throw new Error(data.message || data.error || t('home.error.aiFailed'));
        }

        const result = data.data;

        // 停止假进度条并设置完成状态
        stopFakeProgress();
        setProcessing((prev) => ({ ...prev, progress: 100, message: t('home.processing.complete') }));

        // 设置生成后的图片
        setGeneratedImage(result.generatedImg);
        setCompareSlider(50);

        // 刷新历史记录数据
        if (result.generationId) {
          fetchHistoryData();
        }

        // 更新Credit余额
        if (typeof result.newBalance === 'number') {
          setCreditInfo((prev) => ({
            ...prev,
            balance: Number(formatBalance(result.newBalance, decimal)),
          }));
        }

        setProcessing({
          isProcessing: false,
          progress: 0,
          message: '',
        });
        setProcessingText(''); // 清除处理文本
      } catch (err: any) {
        console.error('AI processing error:', err);

        let errorMessage = t('home.error.processingFailed');

        if (err?.response?.data) {
          const apiError = err.response.data;
          errorMessage = apiError.message || apiError.error || errorMessage;

          if (apiError.error === '积分不足' || apiError.message?.includes('积分不足')) {
            checkUserCredits();
          }
        } else if (err instanceof Error) {
          if (err.message.includes('Network Error') || err.message.includes('timeout')) {
            errorMessage = t('home.error.networkError');
          } else if (err.message.includes('401') || err.message.includes('未认证')) {
            errorMessage = t('home.error.authError');
          } else if (err.message.includes('500')) {
            errorMessage = t('home.error.serviceUnavailable');
          } else {
            errorMessage = `处理失败：${err.message}`;
          }
        }

        // 停止假进度条
        stopFakeProgress();
        setError(errorMessage);
        setProcessing({
          isProcessing: false,
          progress: 0,
          message: '',
        });
        setProcessingText(''); // 清除处理文本
      }
    },
    [
      isLoggedIn,
      creditInfo.balance,
      inputType,
      config.controlsConfig?.inputConfig.imageSize,
      t,
      startFakeProgress,
      controlValues,
      config.clientId,
      stopFakeProgress,
      fetchHistoryData,
      decimal,
      checkUserCredits,
    ],
  );

  // 处理图片变更
  const handleImagesChange = useCallback(
    async (images: string[]) => {
      setOriginalImages(images);
      setGeneratedImage(null);
      setError(null);

      // 判断是否需要手动确认生成
      const imageSize = config.controlsConfig?.inputConfig.imageSize || 1;
      const isMultiImage = imageSize > 1;

      // 对于单图场景，自动开始处理
      // 对于多图场景，需要用户手动确认
      if (!isMultiImage && images.length >= imageSize) {
        await generate({ images });
      }
    },
    [config.controlsConfig?.inputConfig.imageSize, generate],
  );

  // 手动触发生成
  const handleManualGenerate = useCallback(async () => {
    if (inputType === 'text') {
      if (textInput.trim()) {
        await generate({ text: textInput });
      }
    } else if (originalImages.length > 0) {
      await generate({ images: originalImages });
    }
  }, [originalImages, textInput, inputType, generate]);

  // 下载生成后的图片
  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(getImageUrl(generatedImage));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generatedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(t('home.error.downloadFailed'));
    }
  };

  // 重试生成功能
  const handleRetry = async () => {
    const hasContent = inputType === 'text' ? textInput.trim() : originalImages.length > 0;
    if (!hasContent || processing.isProcessing) return;

    // 检查Credit余额
    const requiredCredits = 1;
    if (creditInfo.balance < requiredCredits) {
      setError(t('home.error.insufficientCreditsRetry'));
      return;
    }

    // 重置状态
    setGeneratedImage(null);
    setCompareSlider(50);
    setError(null);

    // 重新调用AI处理
    if (inputType === 'text') {
      await generate({ text: textInput });
    } else {
      await generate({ images: originalImages });
    }
  };

  // 复制图片到剪贴板
  const handleCopyImage = async (imageUrl: string, itemId?: string) => {
    try {
      // 获取图片数据
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // 检查浏览器是否支持复制图片
      if (navigator.clipboard && window.ClipboardItem) {
        // 将图片转换为 PNG 格式，因为大多数浏览器只支持 image/png
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob(async (pngBlob) => {
              if (pngBlob) {
                try {
                  const clipboardItem = new ClipboardItem({
                    'image/png': pngBlob,
                  });
                  await navigator.clipboard.write([clipboardItem]);

                  // 复制成功，更新状态
                  if (itemId) {
                    setCopiedItems((prev) => new Set([...prev, itemId]));
                    // 2秒后移除成功状态
                    setTimeout(() => {
                      setCopiedItems((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(itemId);
                        return newSet;
                      });
                    }, 2000);
                  }

                  resolve(undefined);
                } catch (writeErr) {
                  console.error('Failed to write to clipboard:', writeErr);
                  reject(writeErr);
                }
              } else {
                reject(new Error('Failed to convert image to PNG'));
              }
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });
      } else {
        console.warn('Clipboard API not supported for images in this browser');
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  // 下载历史图片
  const handleDownloadHistoryImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // 查看大图
  const handleViewLargeImage = (imageUrl: string) => {
    setViewImageDialog({ open: true, imageUrl });
  };

  // 关闭大图对话框
  const handleCloseImageDialog = () => {
    setViewImageDialog({ open: false, imageUrl: null });
  };

  // 显示删除确认对话框
  const handleShowDeleteDialog = (itemId: string) => {
    setDeleteDialog({ open: true, itemId });
  };

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, itemId: null });
  };

  // 删除历史图片
  const handleDeleteHistoryImage = async () => {
    if (!deleteDialog.itemId) return;

    try {
      setIsDeleting(true);

      const { data } = await api.delete(`/api/ai/generation/${deleteDialog.itemId}`);

      if (data.success) {
        // 删除成功，从历史记录中移除该项
        setGeneratedHistory((prev) => prev.filter((item) => item.id !== deleteDialog.itemId));

        // 更新分页信息
        setHistoryPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        setError(null);
        handleCloseDeleteDialog();
      } else {
        setError(data.message || t('home.deleteConfirm.failed'));
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(t('home.deleteConfirm.failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  // 分享功能处理
  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  // 获取分享的URL和标题
  const getShareUrl = () => {
    if (session?.user) {
      return `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?inviter=${session.user.did}`;
    }
    return window.location.href;
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: theme.palette.background.default,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
        },
      })}>
      <Helmet>
        <title>{config.title || t('home.title')}</title>
      </Helmet>
      {/* 顶部标题栏 - 响应式精致设计 */}
      <Box
        sx={(theme) => ({
          py: { xs: 1, sm: 1.5, md: 2 },
          px: { xs: 2, sm: 3, md: 4 },
          borderBottom: `2px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          boxShadow: theme.shadows[2],
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`,
          },
        })}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 1, sm: 0 }}>
          {/* 左侧标题 */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h4"
                sx={(theme) => ({
                  fontWeight: 400,
                  color: theme.palette.primary.main,
                  lineHeight: 1.1,
                  letterSpacing: '0.5px',
                  textAlign: { xs: 'center', sm: 'left' },
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                })}>
                {config.title || t('home.title')}
              </Typography>

              {/* 分享按钮 */}
              <IconButton
                onClick={handleShareClick}
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}10`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}20`,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                })}>
                <ShareIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            <Typography
              variant="body2"
              sx={(theme) => ({
                fontStyle: 'italic',
                color: theme.palette.text.secondary,
                letterSpacing: '0.3px',
                mt: 0.5,
                textAlign: { xs: 'center', sm: 'left' },
                display: { xs: 'none', sm: 'block' },
              })}>
              {config.subtitle || t('home.subtitle')}
            </Typography>
          </Box>

          {/* 右侧Credit余额 - 简洁设计 */}
          {isLoggedIn && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                borderRadius: '20px',
                border: `1px solid ${theme.palette.divider}`,
                px: 2,
                py: 1,
                backdropFilter: 'blur(10px)',
                boxShadow: theme.shadows[2],
                mt: { xs: 1, sm: 0 },
              })}>
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                })}>
                {t('home.credits')}
              </Typography>

              <Typography
                variant="h6"
                onClick={() => {
                  if (isLoggedIn) {
                    window.open(getCreditPage(), '_blank');
                  }
                }}
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  cursor: isLoggedIn ? 'pointer' : 'default',
                  '&:hover': isLoggedIn
                    ? {
                        color: theme.palette.primary.light,
                        textDecoration: 'underline',
                      }
                    : {},
                })}>
                {creditInfo.balance}
              </Typography>

              <IconButton
                size="small"
                disabled={creatingCheckout}
                onClick={handleCreateCheckout}
                sx={(theme) => ({
                  width: 24,
                  height: 24,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  ml: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                })}>
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Box>
      {/* 主要内容区容器 - 确保第一屏占满 */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 160px)', // 减去header和标题栏的大概高度
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}>
        {/* 主要内容区 - 响应式布局 */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'visible',
            position: 'relative',
          }}>
          {/* 左侧：上传和操作区 */}
          <Box
            sx={(theme) => ({
              width: { xs: '100%', md: '50%' },
              p: { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5, md: 3 },
              borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
              borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
              flex: 1,
            })}>
            {/* 新用户欢迎礼包 */}
            {isLoggedIn && showWelcomeGift && (
              <Fade in timeout={1000}>
                <VintageCard
                  elevation={6}
                  sx={(theme) => ({
                    py: 2,
                    px: 3,
                    backgroundColor: `${theme.palette.primary.light}20`,
                    border: `2px solid ${theme.palette.primary.main}`,
                    position: 'relative',
                  })}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CardGiftcardIcon sx={(theme) => ({ color: theme.palette.primary.main, fontSize: 32 })} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={(theme) => ({ color: theme.palette.text.primary, mb: 0.5 })}>
                        {t('home.welcome.title')}
                      </Typography>
                      <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 1 })}>
                        {t('home.welcome.description')}
                      </Typography>
                    </Box>
                    <GoldenButton size="small" onClick={handleClaimFreeCredits} startIcon={<CardGiftcardIcon />}>
                      {t('home.welcome.claim')}
                    </GoldenButton>
                  </Stack>
                </VintageCard>
              </Fade>
            )}

            {/* Credit不足提示 - 精致设计 */}
            {isLoggedIn && checkBalanceSuccess && creditInfo.balance === 0 && !showWelcomeGift && (
              <VintageCard
                elevation={2}
                sx={(theme) => ({
                  backgroundColor: `${theme.palette.warning.light}20`,
                  border: `2px solid ${theme.palette.warning.main}40`,
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                })}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={(theme) => ({
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}33, ${theme.palette.warning.dark}26)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.warning.main}4D`,
                    })}>
                    <AccountBalanceWalletIcon sx={(theme) => ({ color: theme.palette.warning.main, fontSize: 20 })} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: theme.palette.primary.dark,
                        mb: 0.5,
                      })}>
                      {t('home.balance.insufficient')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                        lineHeight: 1.4,
                      })}>
                      {t('home.balance.description')}
                    </Typography>
                  </Box>
                  <Button
                    size="large"
                    onClick={handleCreateCheckout}
                    sx={(theme) => ({
                      backgroundColor: theme.palette.warning.main,
                      color: theme.palette.common.white,
                      fontWeight: 500,
                      px: 2,
                      py: 0.5,
                      borderRadius: '20px',
                      textTransform: 'none',
                      boxShadow: `0 2px 8px ${theme.palette.warning.dark}4D`,
                      '&:hover': {
                        backgroundColor: theme.palette.warning.light,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${theme.palette.warning.dark}66`,
                      },
                    })}>
                    {t('home.balance.recharge')}
                  </Button>
                </Stack>
              </VintageCard>
            )}

            {/* 错误提示 - 精致设计 */}
            {error && (
              <VintageCard
                elevation={2}
                sx={(theme) => ({
                  background: `linear-gradient(135deg, ${theme.palette.error.main}14 0%, ${theme.palette.error.dark}0D 100%)`,
                  border: `2px solid ${theme.palette.error.main}33`,
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                })}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={(theme) => ({
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.error.main}26, ${theme.palette.error.dark}1A)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.error.main}33`,
                      flexShrink: 0,
                      mt: 0.5,
                    })}>
                    <Typography
                      sx={(theme) => ({ color: theme.palette.error.dark, fontSize: '18px', fontWeight: 'bold' })}>
                      !
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: theme.palette.primary.dark,
                        mb: 0.5,
                      })}>
                      {t('home.error.title')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      })}>
                      {error}
                    </Typography>
                  </Box>
                  <IconButton
                    size="large"
                    onClick={() => setError(null)}
                    sx={(theme) => ({
                      color: `${theme.palette.error.main}99`,
                      flexShrink: 0,
                      '&:hover': {
                        color: theme.palette.error.dark,
                        backgroundColor: `${theme.palette.error.main}1A`,
                      },
                    })}>
                    <CloseIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Stack>
              </VintageCard>
            )}

            {/* 上传区域 - 根据输入类型选择 */}
            <VintageCard elevation={4} style={{ flex: 1 }}>
              {processing.isProcessing ? (
                <Box sx={{ py: { xs: 3, sm: 4 } }}>
                  <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    <AutoFixHighIcon
                      sx={(theme) => ({
                        fontSize: 48,
                        color: theme.palette.primary.main,
                        animation: `${sparkleAnimation} 2s ease-in-out infinite`,
                      })}
                    />
                    <Typography
                      variant="h6"
                      textAlign="center"
                      sx={(theme) => ({
                        color: theme.palette.text.primary,
                        fontStyle: 'italic',
                      })}>
                      {t('home.processing.magic')}
                    </Typography>
                    <Typography
                      variant="body2"
                      textAlign="center"
                      sx={(theme) => ({ color: theme.palette.text.secondary })}>
                      {t('home.processing.wait')}
                    </Typography>
                  </Stack>
                </Box>
              ) : inputType === 'text' ? (
                <TextInput
                  value={textInput}
                  onChange={setTextInput}
                  requirements={
                    config.controlsConfig?.inputConfig.requirements?.[locale] ||
                    config.controlsConfig?.inputConfig.requirements?.en ||
                    t('textInput.placeholder')
                  }
                  disabled={processing.isProcessing}
                  isLoggedIn={isLoggedIn}
                  openLoginDialog={() => {
                    session?.login();
                  }}
                  onGenerate={handleManualGenerate}
                  showGenerateButton
                />
              ) : (
                <MultiImageUploader
                  images={originalImages}
                  onImagesChange={handleImagesChange}
                  imageSize={config.controlsConfig?.inputConfig.imageSize || 1}
                  imageDescriptions={config.controlsConfig?.inputConfig.imageDescriptions}
                  requirements={config.controlsConfig?.inputConfig.requirements}
                  isLoggedIn={isLoggedIn}
                  openLoginDialog={() => {
                    session?.login();
                  }}
                  disabled={processing.isProcessing}
                  currentLanguage={locale}
                  onGenerate={handleManualGenerate}
                  showGenerateButton={(config.controlsConfig?.inputConfig.imageSize || 1) > 1}
                />
              )}
            </VintageCard>

            {/* 动态控制组件 */}
            {config.controlsConfig?.controlsConfig && config.controlsConfig.controlsConfig.length > 0 && (
              <VintageCard elevation={2} sx={{ py: 2, px: 3 }}>
                <ProjectControls
                  controlsConfig={config.controlsConfig.controlsConfig}
                  values={controlValues}
                  onChange={setControlValues}
                  disabled={processing.isProcessing}
                />
              </VintageCard>
            )}

            {/* 使用指南 - 始终显示 */}
            <VintageCard elevation={2} sx={{ py: 2, px: 3 }}>
              <Typography
                variant="subtitle2"
                sx={(theme) => ({
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.875rem',
                })}>
                {t('home.userGuide.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  textAlign: 'left',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                })}>
                {config.description || t('home.userGuide.defaultDescription')}
              </Typography>
            </VintageCard>
          </Box>

          {/* 右侧：结果展示区 */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              p: { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}>
            {/* 主要显示区域 - 始终显示内容 */}
            <VintageCard
              elevation={8}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px', padding: 2 }}>
              <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
                {processing.isProcessing ? (
                  // 处理中状态
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {inputType === 'text' ? (
                      // 文本模式：显示输入的文本内容
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: '400px',
                          mb: 3,
                          borderRadius: '16px',
                          border: (theme) => `2px solid ${theme.palette.divider}`,
                          backgroundColor: (theme) => theme.palette.background.paper,
                          p: 3,
                        }}>
                        <Typography
                          variant="body1"
                          sx={(theme) => ({
                            color: theme.palette.text.primary,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            maxHeight: '200px',
                            overflow: 'auto',
                          })}>
                          {processingText || '正在处理文本内容...'}
                        </Typography>
                      </Box>
                    ) : (
                      // 图片模式：显示原图
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: '300px',
                          mb: 3,
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: (theme) => `2px solid ${theme.palette.divider}`,
                        }}>
                        <CompareImage src={getImageUrl(originalImages[0] || '')} alt={t('home.image.processing')} />
                      </Box>
                    )}

                    <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: '250px' }}>
                      <AutoFixHighIcon
                        sx={(theme) => ({
                          fontSize: 36,
                          color: theme.palette.primary.main,
                          animation: `${sparkleAnimation} 2s ease-in-out infinite`,
                        })}
                      />
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        sx={(theme) => ({
                          color: theme.palette.text.primary,
                          fontStyle: 'italic',
                        })}>
                        {processing.message}
                      </Typography>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={processing.progress}
                          sx={(theme) => ({
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.divider,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 3,
                            },
                          })}
                        />
                        <Typography
                          variant="body2"
                          textAlign="center"
                          sx={(theme) => ({ color: theme.palette.text.secondary, mt: 1 })}>
                          {Math.round(processing.progress)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : generatedImage ? (
                  // 有图片时的展示 - 根据配置决定是否显示对比
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <ImageCompareContainer sx={{ flex: 1, maxWidth: 'none', display: 'flex', alignItems: 'center' }}>
                      <ImageWrapper>
                        {config.uiConfig?.features?.showComparisonSlider !== false ? (
                          // 对比模式：显示原图和生成图的对比
                          <>
                            <CompareImage
                              src={getImageUrl(originalImages[0] || '')}
                              alt="原图"
                              style={{
                                position: generatedImage ? 'absolute' : 'relative',
                                clipPath: generatedImage ? `inset(0 ${100 - compareSlider}% 0 0)` : 'none',
                                zIndex: 2,
                              }}
                            />

                            {generatedImage && (
                              <>
                                <CompareImage
                                  src={getImageUrl(generatedImage)}
                                  alt={t('home.image.restoredImage')}
                                  style={{
                                    position: 'absolute',
                                    clipPath: `inset(0 0 0 ${compareSlider}%)`,
                                    zIndex: 1,
                                  }}
                                />

                                <Box
                                  sx={(theme) => ({
                                    position: 'absolute',
                                    left: `${compareSlider}%`,
                                    top: 0,
                                    bottom: 0,
                                    width: '2px',
                                    backgroundColor: theme.palette.primary.main,
                                    boxShadow: `0 0 6px ${theme.palette.primary.main}60`,
                                    transform: 'translateX(-1px)',
                                    zIndex: 5,
                                  })}
                                />

                                <Chip
                                  label={t('home.image.original')}
                                  size="small"
                                  sx={(theme) => ({
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    background: `${theme.palette.common.black}B3`,
                                    color: theme.palette.common.white,
                                    zIndex: 6,
                                  })}
                                />
                                <Chip
                                  label={t('home.image.restored')}
                                  size="small"
                                  sx={(theme) => ({
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.common.white,
                                    zIndex: 6,
                                  })}
                                />
                              </>
                            )}
                          </>
                        ) : (
                          // 单图模式：只显示生成的图片或原图（如果还没有生成结果）
                          // 严格限制高度以适应第一屏，确保图片完整显示
                          generatedImage && (
                            <CompareImage
                              src={getImageUrl(generatedImage)}
                              alt={t('home.image.restoredImage')}
                              style={{
                                position: 'absolute',
                                zIndex: 1,
                              }}
                            />
                          )
                        )}
                      </ImageWrapper>
                    </ImageCompareContainer>

                    {/* 滑块移到图片下方 - 根据配置显示 */}
                    {generatedImage && config.uiConfig?.features?.showComparisonSlider !== false && (
                      <Box sx={{ mt: 1, px: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 1 }}>
                          <Slider
                            value={compareSlider}
                            onChange={(_, value) => setCompareSlider(value as number)}
                            min={0}
                            max={100}
                            sx={(theme) => ({
                              height: 6,
                              flex: 1,
                              '& .MuiSlider-track': {
                                backgroundColor: theme.palette.primary.main,
                                height: 4,
                                border: 'none',
                                borderRadius: 2,
                              },
                              '& .MuiSlider-rail': {
                                backgroundColor:
                                  theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
                                height: 4,
                                borderRadius: 2,
                                opacity: 1,
                              },
                              '& .MuiSlider-thumb': {
                                width: 24,
                                height: 24,
                                backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : theme.palette.common.white,
                                border: `3px solid ${theme.palette.primary.main}`,
                                boxShadow:
                                  theme.palette.mode === 'dark'
                                    ? `0 4px 12px ${theme.palette.common.black}60, 0 0 0 1px ${theme.palette.primary.main}40`
                                    : `0 2px 8px ${theme.palette.common.black}20, 0 0 0 1px ${theme.palette.common.white}`,
                                '&:hover': {
                                  backgroundColor:
                                    theme.palette.mode === 'dark' ? '#2a2a2a' : theme.palette.common.white,
                                  boxShadow:
                                    theme.palette.mode === 'dark'
                                      ? `0 6px 16px ${theme.palette.common.black}80, 0 0 0 3px ${theme.palette.primary.main}60`
                                      : `0 4px 12px ${theme.palette.common.black}30, 0 0 0 2px ${theme.palette.primary.light}`,
                                },
                                '&.Mui-active': {
                                  backgroundColor:
                                    theme.palette.mode === 'dark' ? '#3a3a3a' : theme.palette.common.white,
                                  boxShadow:
                                    theme.palette.mode === 'dark'
                                      ? `0 6px 16px ${theme.palette.common.black}80, 0 0 0 3px ${theme.palette.primary.main}`
                                      : `0 4px 12px ${theme.palette.common.black}30, 0 0 0 2px ${theme.palette.primary.main}`,
                                },
                              },
                            })}
                          />
                        </Stack>
                      </Box>
                    )}
                  </Box>
                ) : (
                  // 空状态
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                    }}>
                    <Stack alignItems="center" spacing={2}>
                      <PaletteIcon
                        sx={(theme) => ({
                          fontSize: 48,
                          color: theme.palette.divider,
                        })}
                      />
                      <Typography
                        variant="body1"
                        sx={(theme) => ({
                          textAlign: 'center',
                          fontStyle: 'italic',
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        })}>
                        {t('home.empty.result')}
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          sx={(theme) => ({ color: theme.palette.text.disabled })}>
                          {t('home.empty.waiting')}
                        </Typography>
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* 操作按钮区域 - 生成后才显示 */}
              {generatedImage && (
                <>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1.5, sm: 2 }}
                    justifyContent="center"
                    sx={{ p: 1.5, pt: 2 }}>
                    <GoldenButton
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="medium"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '1rem' },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.75, sm: 1 },
                        width: { xs: '100%', sm: 'auto' },
                      }}>
                      {t('home.actions.download')}
                    </GoldenButton>
                    {(inputType === 'text' ? textInput.trim() : originalImages.length > 0) && (
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        disabled={processing.isProcessing}
                        size="medium"
                        sx={(theme) => ({
                          borderColor: `${theme.palette.primary.main}80`,
                          color: theme.palette.text.primary,
                          fontWeight: 500,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.75, sm: 1 },
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontSize: { xs: '0.75rem', sm: '1rem' },
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: `${theme.palette.primary.main}20`,
                          },
                          '&:disabled': {
                            borderColor: `${theme.palette.primary.main}30`,
                            color: theme.palette.text.secondary,
                          },
                        })}>
                        {t('home.actions.retry')}
                      </Button>
                    )}
                  </Stack>

                  {/* Powered by AIGNE */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pb: 0,
                      px: 1.5,
                    }}>
                    <Box
                      component="a"
                      href="https://www.aigne.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        opacity: 0.8,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                          transform: 'translateY(-1px)',
                        },
                      }}>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                          fontSize: '1rem',
                          fontStyle: 'italic',
                        })}>
                        powered by
                      </Typography>
                      <img
                        src={`https://www.aigne.io/.well-known/service/blocklet/logo-rect${
                          theme.palette.mode === 'dark' ? '-dark' : ''
                        }`}
                        alt="AIGNE"
                        style={{
                          height: '24px',
                          width: 'auto',
                          opacity: 0.8,
                        }}
                      />
                    </Box>
                  </Box>
                </>
              )}
            </VintageCard>
          </Box>
        </Box>
      </Box>
      {/* 历史记录区域 - 页面底部 */}
      {generatedHistory.length > 0 && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            mt: 3,
            px: { xs: 2, sm: 3, md: 4 },
            pb: 4,
          }}>
          <VintageCard elevation={6} sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={(theme) => ({
                mb: 3,
                color: theme.palette.text.primary,
                textAlign: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '30%',
                  right: '30%',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}60, transparent)`,
                },
              })}>
              {t('home.history.title')} ({historyPagination.total})
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)', // 手机端显示2列
                  sm: 'repeat(3, 1fr)', // 平板端显示3列
                  md: 'repeat(4, 1fr)', // 中等屏幕显示4列
                  lg: 'repeat(5, 1fr)', // 大屏幕显示5列
                  xl: 'repeat(6, 1fr)', // 超大屏幕显示6列
                },
                gap: { xs: 1.5, sm: 2, md: 2.5 },
                mt: 2,
              }}>
              {generatedHistory.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => {
                    // 只有在支持对比滑块时才允许选中历史记录
                    if (!processing.isProcessing && config.uiConfig?.features?.showComparisonSlider !== false) {
                      setOriginalImages([item.originalImg]);
                      setGeneratedImage(item.generatedImg);
                      setCompareSlider(50);
                      // 滚动到顶部查看结果
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  sx={(theme) => ({
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: config.uiConfig?.features?.showComparisonSlider !== false ? 'pointer' : 'default',
                    border: `2px solid ${theme.palette.primary.main}30`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    background: `${theme.palette.background.paper}E6`,
                    boxShadow: `0 2px 8px ${theme.palette.divider}`,
                    opacity: 1,
                    '&:hover':
                      config.uiConfig?.features?.showComparisonSlider !== false
                        ? {
                            border: `2px solid ${theme.palette.primary.main}`,
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: `0 4px 16px ${theme.palette.primary.main}50`,
                            '& .hover-overlay': {
                              opacity: 1,
                            },
                          }
                        : {
                            '& .hover-overlay': {
                              opacity: 1,
                            },
                          },
                  })}>
                  <img
                    src={getImageUrl(item.generatedImg)}
                    alt={t('home.image.history')}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* 底部工具栏 */}
                  <Box
                    className="hover-overlay"
                    sx={(theme) => ({
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: `linear-gradient(transparent, ${theme.palette.common.black}B3)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      py: 0.5,
                      zIndex: 2,
                      '@media (max-width: 600px)': {
                        opacity: 1,
                      },
                    })}
                    onClick={(e) => e.stopPropagation()} // 防止触发父元素的点击事件
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewLargeImage(getImageUrl(item.generatedImg));
                      }}
                      sx={(theme) => ({
                        background: `${theme.palette.background.paper}E6`,
                        color: theme.palette.primary.main,
                        width: 28,
                        height: 28,
                        '&:hover': {
                          background: theme.palette.common.white,
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      })}>
                      <FullscreenIcon sx={{ fontSize: 14 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyImage(getImageUrl(item.generatedImg), item.id);
                      }}
                      sx={(theme) => ({
                        background: copiedItems.has(item.id)
                          ? `${theme.palette.success.main}E6`
                          : `${theme.palette.background.paper}E6`,
                        color: copiedItems.has(item.id) ? 'white' : theme.palette.primary.main,
                        width: 28,
                        height: 28,
                        '&:hover': {
                          background: copiedItems.has(item.id) ? `${theme.palette.success.main}` : 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                      })}>
                      {copiedItems.has(item.id) ? (
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadHistoryImage(getImageUrl(item.generatedImg), `generated_${item.id}`);
                      }}
                      sx={(theme) => ({
                        background: `${theme.palette.background.paper}E6`,
                        color: theme.palette.primary.main,
                        width: 28,
                        height: 28,
                        '&:hover': {
                          background: theme.palette.common.white,
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      })}>
                      <DownloadIcon sx={{ fontSize: 14 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDeleteDialog(item.id);
                      }}
                      sx={(theme) => ({
                        background: `${theme.palette.background.paper}E6`,
                        color: theme.palette.error.main,
                        width: 28,
                        height: 28,
                        '&:hover': {
                          background: theme.palette.common.white,
                          color: theme.palette.error.dark,
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      })}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>

                  {/* 底部时间显示 */}
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: `linear-gradient(transparent, ${theme.palette.common.black}80)`,
                      p: 0.5,
                      pointerEvents: 'none', // 让底部信息不阻挡悬停事件
                      zIndex: 1,
                      '.hover-overlay': {
                        opacity: 1,
                      },
                      '.hover-overlay ~ &': {
                        opacity: 0,
                      },
                    })}>
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.common.white,
                        fontSize: '0.6rem',
                        textShadow: `0 1px 2px ${theme.palette.common.black}CC`,
                        lineHeight: 1.2,
                      })}>
                      {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* 加载更多按钮 */}
            {historyPagination.hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => fetchHistoryData(historyPagination.offset + historyPagination.limit)}
                  disabled={loadingHistory}
                  sx={(theme) => ({
                    borderColor: `${theme.palette.primary.main}80`,
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    px: 4,
                    py: 1,
                    borderRadius: '25px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: `${theme.palette.primary.main}20`,
                    },
                    '&:disabled': {
                      borderColor: `${theme.palette.primary.main}30`,
                      color: theme.palette.text.secondary,
                    },
                  })}>
                  {loadingHistory
                    ? t('home.history.loading')
                    : `${t('home.history.loadMore')} (${historyPagination.total - generatedHistory.length} ${t('home.history.countUnit')})`}
                </Button>
              </Box>
            )}
          </VintageCard>
        </Box>
      )}
      {/* 查看大图对话框 */}
      <Dialog
        open={viewImageDialog.open}
        onClose={handleCloseImageDialog}
        maxWidth={false}
        sx={(theme) => ({
          '& .MuiDialog-paper': {
            background: `${theme.palette.common.black}E6`,
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: `1px solid ${theme.palette.primary.main}50`,
            overflow: 'hidden',
            maxWidth: '95vw',
            maxHeight: '95vh',
            width: 'auto',
            height: 'auto',
            margin: '2.5vh auto',
          },
        })}>
        <DialogContent
          sx={{
            position: 'relative',
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}>
          {/* 关闭按钮 */}
          <IconButton
            onClick={handleCloseImageDialog}
            sx={(theme) => ({
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              background: `${theme.palette.background.paper}E6`,
              color: theme.palette.primary.main,
              width: 32,
              height: 32,
              '&:hover': {
                background: theme.palette.common.white,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            })}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* 大图展示 */}
          {viewImageDialog.imageUrl && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
              }}>
              <img
                src={viewImageDialog.imageUrl}
                alt={t('home.actions.viewLarge')}
                style={{
                  maxWidth: 'calc(95vw - 32px)',
                  maxHeight: 'calc(95vh - 32px)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          '& .MuiDialog-paper': {
            backgroundColor: theme.palette.background.paper,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          },
        })}>
        <DialogTitle
          sx={(theme) => ({
            color: theme.palette.text.primary,
            fontWeight: 500,
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}>
          {t('home.deleteConfirm.title')}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            })}>
            {t('home.deleteConfirm.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            disabled={isDeleting}
            sx={(theme) => ({
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              textTransform: 'none',
              '&:hover': {
                borderColor: theme.palette.text.primary,
                backgroundColor: theme.palette.divider,
              },
            })}>
            {t('home.deleteConfirm.cancel')}
          </Button>
          <Button
            onClick={handleDeleteHistoryImage}
            variant="contained"
            disabled={isDeleting}
            sx={(theme) => ({
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              },
              '&:disabled': {
                background: `${theme.palette.error.main}4D`,
                color: `${theme.palette.background.paper}B3`,
              },
            })}>
            {isDeleting ? t('home.deleteConfirm.deleting') : t('home.deleteConfirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* 分享菜单 */}
      <Menu
        anchorEl={shareAnchorEl}
        open={shareMenuOpen}
        onClose={handleShareClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[8],
              mt: 1,
              minWidth: '200px',
            }),
          },
        }}>
        <Box sx={{ p: 1 }}>
          <Typography
            variant="subtitle2"
            sx={(theme) => ({
              px: 2,
              py: 1,
              color: theme.palette.text.secondary,
              textAlign: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
              mb: 1,
            })}>
            {t('home.share.title')}
          </Typography>

          <Stack spacing={0.5}>
            <MenuItem
              onClick={handleShareClose}
              sx={{
                borderRadius: '8px',
                '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.1)' },
              }}>
              <TwitterShareButton
                url={getShareUrl()}
                title={config.title || t('home.title')}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                  <XIcon size={24} round />
                  <Typography variant="body2">Twitter (X)</Typography>
                </Stack>
              </TwitterShareButton>
            </MenuItem>

            <MenuItem
              onClick={handleShareClose}
              sx={{
                borderRadius: '8px',
                '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.1)' },
              }}>
              <FacebookShareButton url={getShareUrl()} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                  <FacebookIcon size={24} round />
                  <Typography variant="body2">Facebook</Typography>
                </Stack>
              </FacebookShareButton>
            </MenuItem>
          </Stack>
        </Box>
      </Menu>
    </Box>
  );
}

export default function AIProjectHome({ config }: AIProjectHomeProps) {
  return (
    <UploaderProvider>
      <AIProjectHomeComponent config={config} />
    </UploaderProvider>
  );
}
