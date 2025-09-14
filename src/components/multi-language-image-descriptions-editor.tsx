import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Badge,
  Box,
  Button,
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

import { SUPPORTED_LANGUAGES } from './project-content-editor';

interface MultiLanguageImageDescriptionsEditorProps {
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
  maxImages: number;
  disabled?: boolean;
}

export default function MultiLanguageImageDescriptionsEditor({
  values,
  onChange,
  maxImages,
  disabled = false,
}: MultiLanguageImageDescriptionsEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copyMenuAnchor, setCopyMenuAnchor] = useState<null | HTMLElement>(null);
  const [copyImageIndex, setCopyImageIndex] = useState<number>(-1);

  const currentLanguage = SUPPORTED_LANGUAGES[activeTab];

  const updateImageDescription = (imageIndex: number, description: string) => {
    if (!currentLanguage) return;
    const currentDescriptions = values[currentLanguage.code] || [];
    const newDescriptions = [...currentDescriptions];
    newDescriptions[imageIndex] = description;

    // 不要在用户输入时自动清理空字符串，保持字段稳定性
    onChange({
      ...values,
      [currentLanguage.code]: newDescriptions,
    });
  };

  const addDescription = () => {
    if (!currentLanguage) return;
    const currentDescriptions = values[currentLanguage.code] || [];
    if (currentDescriptions.length >= maxImages) return;

    const newDescriptions = [...currentDescriptions, ''];
    onChange({
      ...values,
      [currentLanguage.code]: newDescriptions,
    });
  };

  const removeDescription = (index: number) => {
    if (!currentLanguage) return;
    const currentDescriptions = values[currentLanguage.code] || [];
    const newDescriptions = currentDescriptions.filter((_, i) => i !== index);
    onChange({
      ...values,
      [currentLanguage.code]: newDescriptions.length > 0 ? newDescriptions : [],
    });
  };

  const handleCopyFrom = (sourceLanguageCode: string) => {
    if (!currentLanguage || copyImageIndex < 0) return;
    const sourceDescriptions = values[sourceLanguageCode] || [];
    const sourceDescription = sourceDescriptions[copyImageIndex];
    if (sourceDescription) {
      updateImageDescription(copyImageIndex, sourceDescription);
    }
    setCopyMenuAnchor(null);
  };

  const getCompletionCount = () => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      const descriptions = values[lang.code] || [];
      return descriptions.some((desc) => desc?.trim());
    }).length;
  };

  const isLanguageComplete = (languageCode: string) => {
    const descriptions = values[languageCode] || [];
    return descriptions.some((desc) => desc?.trim());
  };

  const openCopyMenu = (imageIndex: number, event: React.MouseEvent<HTMLElement>) => {
    setCopyImageIndex(imageIndex);
    setCopyMenuAnchor(event.currentTarget);
  };

  const getAvailableCopyLanguages = (imageIndex: number) => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      if (!currentLanguage || lang.code === currentLanguage.code) return false;
      const descriptions = values[lang.code] || [];
      return descriptions[imageIndex]?.trim();
    });
  };

  if (!currentLanguage) return null;

  const currentDescriptions = values[currentLanguage.code] || [];

  return (
    <Box>
      {/* 标题和状态栏 */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          Image Descriptions (optional):
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addDescription}
          disabled={disabled || currentDescriptions.length >= maxImages}>
          Add Description
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
          {getCompletionCount()}/{SUPPORTED_LANGUAGES.length} 语言
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Describe what each image slot is for. This helps users understand what kind of image to upload for each
        position.
      </Typography>

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
                  <Box component="span" sx={{ fontSize: '0.9rem' }}>
                    {lang.flag}
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.8rem' }}>
                    {lang.code.toUpperCase()}
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

      {/* 图片描述编辑区域 */}
      {currentDescriptions.length > 0 ? (
        <Stack spacing={1}>
          {currentDescriptions.map((description, index) => (
            <Stack
              key={`${currentLanguage.code}-field-${description?.slice(0, 20) || 'empty'}-len-${description?.length || 0}`}
              direction="row"
              spacing={1}
              alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 80 }}>
                Image {index + 1}:
              </Typography>
              <TextField
                size="small"
                placeholder="e.g., 'Upload your main photo here' or 'Background reference image'"
                value={description || ''}
                onChange={(e) => updateImageDescription(index, e.target.value)}
                disabled={disabled}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
              {getAvailableCopyLanguages(index).length > 0 && (
                <Tooltip title="从其他语言复制">
                  <IconButton
                    size="small"
                    onClick={(e) => openCopyMenu(index, e)}
                    disabled={disabled}
                    sx={{ padding: '4px' }}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={() => removeDescription(index)}
                disabled={disabled}
                sx={{ padding: '4px' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
          No image descriptions configured for {currentLanguage.name}. Add descriptions to help users understand what
          each image upload is for.
        </Typography>
      )}

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
          从以下语言复制:
        </MenuItem>
        {copyImageIndex >= 0 &&
          getAvailableCopyLanguages(copyImageIndex).map((lang) => (
            <MenuItem key={lang.code} onClick={() => handleCopyFrom(lang.code)} sx={{ py: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Box component="span" sx={{ fontSize: '0.9rem' }}>
                  {lang.flag}
                </Box>
                <Box component="span" sx={{ fontSize: '0.85rem' }}>
                  {lang.name}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem' }}>
                  {((values[lang.code] || [])[copyImageIndex] || '')?.slice(0, 10)}...
                </Typography>
              </Box>
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}
