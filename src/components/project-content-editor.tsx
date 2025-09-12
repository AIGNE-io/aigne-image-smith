import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Badge, Box, Chip, IconButton, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
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
            {values.name[currentLanguage.code] && getAvailableCopyLanguages('name').length > 0 && (
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
            {values.subtitle[currentLanguage.code] && getAvailableCopyLanguages('subtitle').length > 0 && (
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

        {/* 项目描述 */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              项目描述 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {values.description[currentLanguage.code] && getAvailableCopyLanguages('description').length > 0 && (
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
            placeholder="输入项目描述..."
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

        {/* SEO 图片URL */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              OpenGraph 图片URL <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            {values.seoImageUrl[currentLanguage.code] && getAvailableCopyLanguages('seoImageUrl').length > 0 && (
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
          <TextField
            fullWidth
            value={values.seoImageUrl[currentLanguage.code] || ''}
            onChange={(e) => handleFieldChange('seoImageUrl', e.target.value)}
            disabled={disabled}
            placeholder="https://example.com/image.jpg"
            helperText="用于社交媒体分享的预览图片"
            error={!values.seoImageUrl[currentLanguage.code]?.trim()}
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
