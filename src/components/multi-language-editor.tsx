import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Badge, Box, IconButton, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { SUPPORTED_LANGUAGES } from './project-content-editor';

interface MultiLanguageEditorProps {
  label: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  helperText?: string;
}

export default function MultiLanguageEditor({
  label,
  values,
  onChange,
  disabled = false,
  required = false,
  multiline = false,
  rows = 1,
  placeholder,
  helperText,
}: MultiLanguageEditorProps) {
  const { t } = useLocaleContext();
  const [activeTab, setActiveTab] = useState(0);
  const [copyMenuAnchor, setCopyMenuAnchor] = useState<null | HTMLElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES[activeTab];

  const handleFieldChange = (value: string) => {
    if (!currentLanguage) return;
    onChange({
      ...values,
      [currentLanguage.code]: value,
    });
  };

  const handleCopyFrom = (sourceLanguageCode: string) => {
    if (!currentLanguage) return;
    const sourceValue = values[sourceLanguageCode];
    if (sourceValue) {
      handleFieldChange(sourceValue);
    }
    setCopyMenuAnchor(null);
  };

  const getCompletionCount = () => {
    return SUPPORTED_LANGUAGES.filter((lang) => values[lang.code]?.trim()).length;
  };

  const isLanguageComplete = (languageCode: string) => {
    return Boolean(values[languageCode]?.trim());
  };

  const openCopyMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCopyMenuAnchor(event.currentTarget);
  };

  const getAvailableCopyLanguages = () => {
    return SUPPORTED_LANGUAGES.filter(
      (lang) => currentLanguage && lang.code !== currentLanguage.code && values[lang.code]?.trim(),
    );
  };

  if (!currentLanguage) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {/* 标题和状态栏 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {label} {required && <span style={{ color: '#f44336' }}>*</span>}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {t('components.multiLanguageEditor.languageProgress', {
              completed: getCompletionCount(),
              total: SUPPORTED_LANGUAGES.length,
            })}
          </Typography>
        </Box>
      </Box>

      {/* 语言标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          sx={{
            minHeight: 'auto',
            '& .MuiTab-root': {
              minHeight: 42,
              padding: '8px 12px',
              fontSize: '0.8rem',
            },
          }}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box component="span" sx={{ fontSize: '0.8rem' }}>
                    {lang.name}
                  </Box>
                  {isLanguageComplete(lang.code) && (
                    <Badge
                      color="success"
                      variant="dot"
                      sx={{
                        '& .MuiBadge-dot': {
                          right: -2,
                          top: 2,
                          width: 4,
                          height: 4,
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
      <Box display="flex" alignItems="flex-start" gap={1}>
        <TextField
          fullWidth
          size="small"
          multiline={multiline}
          rows={multiline ? rows : undefined}
          value={values[currentLanguage.code] || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || t('components.multiLanguageEditor.inputPlaceholder', { label })}
          helperText={helperText}
          error={required && !values[currentLanguage.code]?.trim()}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
              lineHeight: 1.4,
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.75rem',
              marginTop: 1,
            },
          }}
        />
        {getAvailableCopyLanguages().length > 0 && (
          <Tooltip title={t('components.multiLanguageEditor.copyFromOther')}>
            <IconButton size="small" onClick={openCopyMenu} disabled={disabled} sx={{ mt: 0.5, padding: '4px' }}>
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 复制菜单 */}
      <Menu
        anchorEl={copyMenuAnchor}
        open={Boolean(copyMenuAnchor)}
        onClose={() => setCopyMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { mt: 1, minWidth: 180 },
        }}>
        <MenuItem disabled sx={{ fontSize: '0.8rem', color: 'text.secondary', py: 0.5 }}>
          {t('components.multiLanguageEditor.copyMenuTitle')}
        </MenuItem>
        {getAvailableCopyLanguages().map((lang) => (
          <MenuItem key={lang.code} onClick={() => handleCopyFrom(lang.code)} sx={{ py: 0.5 }}>
            <Box display="flex" alignItems="center" gap={1} width="100%">
              <Box component="span" sx={{ fontSize: '0.85rem' }}>
                {lang.name}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem' }}>
                {values[lang.code]?.slice(0, 10)}...
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
