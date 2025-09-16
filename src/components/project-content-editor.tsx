import { ContentCopy as ContentCopyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Badge,
  Box,
  Card,
  CardMedia,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { getImageUrl } from '../libs/utils';
import { UploaderButton } from './uploader';

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export interface ProjectContentData {
  name: Record<string, string>;
  subtitle: Record<string, string>;
  description: Record<string, string>;
  seoImageUrl: Record<string, string>;
}

interface ProjectContentEditorProps {
  values: ProjectContentData;
  onChange: (values: ProjectContentData) => void;
  disabled?: boolean;
}

export default function ProjectContentEditor({ values, onChange, disabled = false }: ProjectContentEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copyMenuAnchor, setCopyMenuAnchor] = useState<null | HTMLElement>(null);
  const [copyField, setCopyField] = useState<string>('');

  const currentLanguage = SUPPORTED_LANGUAGES[activeTab];

  const handleFieldChange = (field: keyof ProjectContentData, value: string) => {
    if (!currentLanguage) return;
    onChange({
      ...values,
      [field]: {
        ...values[field],
        [currentLanguage.code]: value,
      },
    });
  };

  const handleCopyFrom = (sourceLanguageCode: string) => {
    if (!currentLanguage || !copyField) return;
    const sourceValue = values[copyField as keyof ProjectContentData][sourceLanguageCode];
    if (sourceValue) {
      handleFieldChange(copyField as keyof ProjectContentData, sourceValue);
    }
    setCopyMenuAnchor(null);
  };

  const getCompletionCount = () => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      return (
        values.name[lang.code]?.trim() &&
        values.subtitle[lang.code]?.trim() &&
        values.description[lang.code]?.trim() &&
        values.seoImageUrl[lang.code]?.trim()
      );
    }).length;
  };

  const isLanguageComplete = (languageCode: string) => {
    return Boolean(
      values.name[languageCode]?.trim() &&
        values.subtitle[languageCode]?.trim() &&
        values.description[languageCode]?.trim() &&
        values.seoImageUrl[languageCode]?.trim(),
    );
  };

  const openCopyMenu = (field: string, event: React.MouseEvent<HTMLElement>) => {
    setCopyField(field);
    setCopyMenuAnchor(event.currentTarget);
  };

  const getAvailableCopyLanguages = (field: keyof ProjectContentData) => {
    return SUPPORTED_LANGUAGES.filter(
      (lang) => currentLanguage && lang.code !== currentLanguage.code && values[field][lang.code]?.trim(),
    );
  };

  if (!currentLanguage) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {/* 标题和状态栏 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
          项目基本信息
        </Typography>
        <Chip
          size="small"
          label={`${getCompletionCount()}/${SUPPORTED_LANGUAGES.length}`}
          color={getCompletionCount() === SUPPORTED_LANGUAGES.length ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>

      {/* 语言标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          sx={{
            minHeight: 'auto',
            '& .MuiTab-root': {
              minHeight: 56,
              padding: '12px 16px',
              fontSize: '0.875rem',
            },
          }}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box component="span" sx={{ fontSize: '1.1rem' }}>
                    {lang.flag}
                  </Box>
                  <Box component="span">{lang.name}</Box>
                  {isLanguageComplete(lang.code) && (
                    <Badge
                      color="success"
                      variant="dot"
                      sx={{
                        '& .MuiBadge-dot': {
                          right: -4,
                          top: 4,
                          width: 6,
                          height: 6,
                        },
                      }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* 当前语言的编辑区域 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 项目名称 */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              项目名称 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {getAvailableCopyLanguages('name').length > 0 && (
              <Tooltip title="从其他语言复制">
                <IconButton
                  size="small"
                  onClick={(e) => openCopyMenu('name', e)}
                  disabled={disabled}
                  sx={{ padding: '4px' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            fullWidth
            value={values.name[currentLanguage.code] || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={disabled}
            placeholder="输入项目名称..."
            error={!values.name[currentLanguage.code]?.trim()}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.95rem',
                lineHeight: 1.5,
              },
            }}
          />
        </Box>

        {/* 项目副标题 */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              项目副标题 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {getAvailableCopyLanguages('subtitle').length > 0 && (
              <Tooltip title="从其他语言复制">
                <IconButton
                  size="small"
                  onClick={(e) => openCopyMenu('subtitle', e)}
                  disabled={disabled}
                  sx={{ padding: '4px' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            fullWidth
            value={values.subtitle[currentLanguage.code] || ''}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            disabled={disabled}
            placeholder="输入项目副标题..."
            error={!values.subtitle[currentLanguage.code]?.trim()}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.95rem',
                lineHeight: 1.5,
              },
            }}
          />
        </Box>

        {/* 项目使用指南 */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              使用指南 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {getAvailableCopyLanguages('description').length > 0 && (
              <Tooltip title="从其他语言复制">
                <IconButton
                  size="small"
                  onClick={(e) => openCopyMenu('description', e)}
                  disabled={disabled}
                  sx={{ padding: '4px' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={values.description[currentLanguage.code] || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            disabled={disabled}
            placeholder="输入使用指南..."
            helperText="详细描述项目的功能和用途"
            error={!values.description[currentLanguage.code]?.trim()}
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
        </Box>

        {/* SEO 图片 */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              OpenGraph 图片 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {getAvailableCopyLanguages('seoImageUrl').length > 0 && (
              <Tooltip title="从其他语言复制">
                <IconButton
                  size="small"
                  onClick={(e) => openCopyMenu('seoImageUrl', e)}
                  disabled={disabled}
                  sx={{ padding: '4px' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {values.seoImageUrl[currentLanguage.code] ? (
            // 显示已上传的图片预览
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Card
                sx={{
                  maxWidth: 300,
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={getImageUrl(values.seoImageUrl[currentLanguage.code]!!)}
                  alt="OpenGraph 预览图片"
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // 如果图片加载失败，显示占位符
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj7lm77niYfkuI3lrZjlnKg8L3RleHQ+Cjwvc3ZnPg==';
                  }}
                />
                {/* 删除按钮 */}
                <IconButton
                  size="small"
                  onClick={() => handleFieldChange('seoImageUrl', '')}
                  disabled={disabled}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)',
                    },
                    width: 28,
                    height: 28,
                  }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Card>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1, fontSize: '0.75rem' }}>
                用于社交媒体分享的预览图片
              </Typography>
            </Box>
          ) : (
            // 显示上传按钮
            <Box
              sx={{
                border: '2px dashed',
                borderColor: !values.seoImageUrl[currentLanguage.code]?.trim() ? 'error.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.50',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  '& .upload-text': {
                    color: 'primary.dark',
                  },
                },
              }}>
              <Stack spacing={2} alignItems="center">
                <UploaderButton
                  isLoggedIn
                  compact={false}
                  title="上传 OpenGraph 图片"
                  description="选择用于社交媒体分享的预览图片"
                  buttonText="选择图片"
                  openLoginDialog={() => {}}
                  onChange={(res: any) => {
                    if (res?.response?.data?.filename) {
                      handleFieldChange('seoImageUrl', res.response.data.filename);
                    }
                  }}
                />
                <Typography
                  variant="caption"
                  color={!values.seoImageUrl[currentLanguage.code]?.trim() ? 'error' : 'text.secondary'}
                  className="upload-text"
                  sx={{ fontSize: '0.75rem', transition: 'color 0.2s ease' }}>
                  支持 JPG、PNG 格式，建议尺寸 1200x630 像素
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* 复制菜单 */}
      <Menu
        anchorEl={copyMenuAnchor}
        open={Boolean(copyMenuAnchor)}
        onClose={() => setCopyMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { mt: 1, minWidth: 200 },
        }}>
        <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary', py: 1 }}>
          从以下语言复制:
        </MenuItem>
        {copyField &&
          getAvailableCopyLanguages(copyField as keyof ProjectContentData).map((lang) => (
            <MenuItem key={lang.code} onClick={() => handleCopyFrom(lang.code)} sx={{ py: 1 }}>
              <Box display="flex" alignItems="center" gap={1.5} width="100%">
                <Box component="span" sx={{ fontSize: '1rem' }}>
                  {lang.flag}
                </Box>
                <Box component="span" sx={{ fontSize: '0.9rem' }}>
                  {lang.name}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
                  {values[copyField as keyof ProjectContentData][lang.code]?.slice(0, 15)}...
                </Typography>
              </Box>
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}
