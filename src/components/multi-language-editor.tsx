import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Badge, Box, Chip, IconButton, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

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

interface MultiLanguageEditorProps {
  label: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function MultiLanguageEditor({
  label,
  values,
  onChange,
  required = false,
  multiline = false,
  rows = 1,
  placeholder,
  helperText,
  disabled = false,
}: MultiLanguageEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copyMenuAnchor, setCopyMenuAnchor] = useState<null | HTMLElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES[activeTab];
  const currentValue = currentLanguage ? values[currentLanguage.code] || '' : '';

  const handleValueChange = (value: string) => {
    if (!currentLanguage) return;
    onChange({
      ...values,
      [currentLanguage.code]: value,
    });
  };

  const handleCopyFrom = (sourceLanguageCode: string) => {
    const sourceValue = values[sourceLanguageCode];
    if (sourceValue) {
      handleValueChange(sourceValue);
    }
    setCopyMenuAnchor(null);
  };

  const getCompletionCount = () => {
    return SUPPORTED_LANGUAGES.filter((lang) => values[lang.code]?.trim()).length;
  };

  const isLanguageComplete = (languageCode: string) => {
    return Boolean(values[languageCode]?.trim());
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 标题和状态栏 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: 4 }}>*</span>}
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Chip
            size="small"
            label={`${getCompletionCount()}/${SUPPORTED_LANGUAGES.length}`}
            color={getCompletionCount() === SUPPORTED_LANGUAGES.length ? 'success' : 'default'}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          {currentValue && (
            <Tooltip title="从其他语言复制内容">
              <IconButton
                size="small"
                onClick={(e) => setCopyMenuAnchor(e.currentTarget)}
                disabled={disabled}
                sx={{ padding: '4px' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
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

      {/* 输入框 */}
      <TextField
        fullWidth
        value={currentValue}
        onChange={(e) => handleValueChange(e.target.value)}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        helperText={helperText}
        disabled={disabled}
        error={required && !currentValue.trim()}
        InputLabelProps={{ shrink: true }}
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
        {SUPPORTED_LANGUAGES.filter(
          (lang) => currentLanguage && lang.code !== currentLanguage.code && values[lang.code]?.trim(),
        ).map((lang) => (
          <MenuItem key={lang.code} onClick={() => handleCopyFrom(lang.code)} sx={{ py: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              <Box component="span" sx={{ fontSize: '1rem' }}>
                {lang.flag}
              </Box>
              <Box component="span" sx={{ fontSize: '0.9rem' }}>
                {lang.name}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
                {values[lang.code]?.slice(0, 15)}...
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
