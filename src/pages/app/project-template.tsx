// @ts-nocheck
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon, History as HistoryIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback, useState } from 'react';

import LanguageSelector from '../../components/language-selector';
import { useSessionContext } from '../../contexts/session';
import useProjectI18n from '../../hooks/use-project-i18n';
import api from '../../libs/api';

interface AIProject {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  promptTemplate: string;
  uiConfig?: Record<string, any>;
  logoUrl?: string;
  metadata?: Record<string, any>;
}

interface ProjectTemplateProps {
  project: AIProject;
  projectId: string;
}

interface GenerationResult {
  generationId: string;
  originalImg: string;
  generatedImg: string;
  processingTimeMs: number;
  creditsConsumed: number;
  fileName: string;
  newBalance: number;
  status: string;
  message: string;
}

const UploadArea = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&.drag-over': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  borderRadius: '8px',
});

export default function ProjectTemplate({ project, projectId }: ProjectTemplateProps) {
  const theme = useTheme();
  const { session } = useSessionContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Use project i18n hook
  const { content: i18nContent, loading: i18nLoading, locale, setLocale, availableLocales } = useProjectI18n(projectId);

  // Apply project's UI config
  const primaryColor = project.uiConfig?.primaryColor || theme.palette.primary.main;

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup function will be handled by React's cleanup
    // return () => URL.revokeObjectURL(url);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // Show loading if i18n content is not ready
  if (i18nLoading || !i18nContent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const processImage = async () => {
    if (!selectedFile || !session?.user) {
      setError('请先选择图片并登录');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Upload file first (using existing uploader)
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/uploader/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-client-info': JSON.stringify({ name: 'pix-loom' }),
        },
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error('图片上传失败');
      }

      // Call AI generation with project-specific prompt
      const response = await api.post('/ai/generate', {
        prompt: project.promptTemplate,
        originalImg: uploadResult.data.filename,
        clientId: projectId,
        metadata: {
          projectId,
          originalFileName: selectedFile.name,
        },
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'AI处理失败');
      }
    } catch (err) {
      console.error('Process image error:', err);
      setError(err instanceof Error ? err.message : 'AI处理失败');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.generatedImg) {
      const link = document.createElement('a');
      link.href = `/api/uploader/files/${result.generatedImg}`;
      link.download = result.fileName || 'generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: primaryColor,
          color: 'white',
          py: 4,
          mb: 4,
        }}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={3}>
              {project.logoUrl && (
                <Box
                  component="img"
                  src={project.logoUrl}
                  alt={i18nContent.ui.title}
                  sx={{ height: 60, borderRadius: 1 }}
                />
              )}
              <Box>
                <Typography variant="h3" component="h1" gutterBottom>
                  {i18nContent.ui.title}
                </Typography>
                {i18nContent.ui.subtitle && (
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {i18nContent.ui.subtitle}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Language Selector */}
            <Box sx={{ '& .MuiSelect-root': { color: 'white' } }}>
              <LanguageSelector
                locale={locale}
                onLocaleChange={setLocale}
                availableLocales={availableLocales}
                size="small"
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid item container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Upload Area */}
              {!result && (
                <Card>
                  <CardContent>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <label htmlFor="file-input">
                      <UploadArea
                        className={dragOver ? 'drag-over' : ''}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: primaryColor, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          {selectedFile ? selectedFile.name : i18nContent.ui.uploadPlaceholder}
                        </Typography>
                        <Button variant="outlined" sx={{ mt: 2 }}>
                          {i18nContent.ui.uploadButton}
                        </Button>
                      </UploadArea>
                    </label>
                  </CardContent>
                </Card>
              )}

              {/* Preview */}
              {previewUrl && !result && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      图片预览
                    </Typography>
                    <Box textAlign="center" mb={2}>
                      <ImagePreview src={previewUrl} alt="Preview" />
                    </Box>
                    <Box display="flex" gap={2} justifyContent="center">
                      <Button variant="outlined" onClick={reset}>
                        重新选择
                      </Button>
                      <Button
                        variant="contained"
                        onClick={processImage}
                        disabled={processing || !session?.user}
                        sx={{ bgcolor: primaryColor }}>
                        {processing ? i18nContent.ui.processingText : i18nContent.ui.processButton}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Processing */}
              {processing && (
                <Card>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <CircularProgress sx={{ color: primaryColor, mb: 2 }} />
                      <Typography variant="h6">{i18nContent.ui.processingText}</Typography>
                      <LinearProgress sx={{ mt: 2, color: primaryColor }} />
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Result */}
              {result && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      {i18nContent.ui.successText}
                    </Typography>

                    <Grid item container spacing={2}>
                      {previewUrl && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            原图
                          </Typography>
                          <CardMedia
                            component="img"
                            image={previewUrl}
                            alt="Original"
                            sx={{ height: 200, objectFit: 'contain', bgcolor: 'grey.100' }}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          处理结果
                        </Typography>
                        <CardMedia
                          component="img"
                          image={`/api/uploader/files/${result.generatedImg}`}
                          alt="Generated"
                          sx={{ height: 200, objectFit: 'contain', bgcolor: 'grey.100' }}
                        />
                      </Grid>
                    </Grid>

                    <Box mt={3} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={downloadResult}
                        sx={{ bgcolor: primaryColor }}>
                        {i18nContent.ui.downloadButton}
                      </Button>

                      <Button variant="outlined" onClick={reset}>
                        {i18nContent.ui.tryAgainButton || '重新处理'}
                      </Button>
                    </Box>

                    {/* Processing Info */}
                    <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Chip label={`处理时间: ${result.processingTimeMs}ms`} size="small" />
                        <Chip label={`消耗积分: ${result.creditsConsumed}`} size="small" />
                        <Chip label={`剩余积分: ${result.newBalance}`} size="small" color="primary" />
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Error */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Features */}
              {i18nContent.features && i18nContent.features.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      功能特性
                    </Typography>
                    <Stack spacing={1}>
                      {i18nContent.features.map((feature) => (
                        <Typography key={feature} variant="body2">
                          • {feature}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              {i18nContent.instructions && i18nContent.instructions.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      使用说明
                    </Typography>
                    <Stack spacing={1}>
                      {i18nContent.instructions.map((instruction, index) => (
                        <Typography key={instruction} variant="body2">
                          {index + 1}. {instruction}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {i18nContent.tips && i18nContent.tips.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      使用技巧
                    </Typography>
                    <Stack spacing={1}>
                      {i18nContent.tips.map((tip) => (
                        <Alert key={tip} severity="info" sx={{ p: 1 }}>
                          <Typography variant="body2">{tip}</Typography>
                        </Alert>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* History Button */}
              {session?.user && (
                <Card>
                  <CardContent>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => {
                        // Navigate to history page (to be implemented)
                        window.open(`/app/${projectId}/history`, '_blank');
                      }}>
                      {i18nContent.ui.historyButton || '查看历史'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
