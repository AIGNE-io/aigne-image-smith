import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import { Box, Button, Card, Chip, IconButton, Stack, Typography, styled } from '@mui/material';
import { useState } from 'react';

import { getImageUrl } from '../libs/utils';
import { SingleImageUploader } from './single-image-uploader';
import { UploaderButton } from './uploader';

// Extract upload trigger component to prevent re-creation on each render
interface UploadTriggerProps {
  onClick: () => void;
  isSingle: boolean;
  isUploading: boolean;
  description?: string;
  index: number;
}

function UploadTrigger({ onClick, isSingle, isUploading, description, index }: UploadTriggerProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={isSingle ? 2 : 1.5}
      sx={{
        p: isSingle ? 3 : 2,
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        display: 'flex',
      }}
      onClick={onClick}>
      {isUploading ? (
        <PhotoSizeSelectActualIcon
          sx={{
            fontSize: isSingle ? 48 : 32,
            color: 'primary.main',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <AddIcon sx={{ fontSize: isSingle ? 48 : 32, color: 'text.secondary' }} />
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{
          fontWeight: 500,
          fontSize: isSingle ? '1rem' : '0.875rem',
          lineHeight: 1.2,
          maxWidth: '100%',
          wordBreak: 'break-word',
        }}>
        {isUploading ? 'Uploading...' : description || `Upload ${index + 1}`}
      </Typography>
    </Stack>
  );
}

const ImagePreviewCard = styled(Card)<{ isSingle?: boolean }>(({ theme, isSingle }) => ({
  position: 'relative',
  aspectRatio: '1',
  width: isSingle ? '100%' : 200,
  height: isSingle ? '100%' : 200,
  maxWidth: isSingle ? 400 : 200,
  maxHeight: isSingle ? 400 : 200,
  overflow: 'hidden',
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    '& .delete-button': {
      opacity: 1,
    },
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 6,
  right: 6,
  backgroundColor: `${theme.palette.error.main}CC`,
  color: theme.palette.common.white,
  width: 32,
  height: 32,
  opacity: 0,
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(4px)',
  boxShadow: theme.shadows[3],
  '&:hover': {
    backgroundColor: theme.palette.error.main,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[6],
  },
}));

const UploadSlot = styled(Card)<{ isSingle?: boolean }>(({ theme, isSingle }) => ({
  aspectRatio: '1',
  width: isSingle ? '100%' : 200,
  height: isSingle ? '100%' : 200,
  maxWidth: isSingle ? 400 : 200,
  maxHeight: isSingle ? 400 : 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'inset 0 0 0 1px transparent',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
    transform: 'translateY(-2px)',
    boxShadow: `${theme.shadows[3]}, inset 0 0 0 1px ${theme.palette.primary.main}20`,
  },
  // 确保内部内容完全居中
  '& > *': {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const SingleUploadArea = styled(Card)(({ theme }) => ({
  border: `3px dashed ${theme.palette.divider}`,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.background.default,
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: theme.shadows[4],
  flex: 1,
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
  },
}));

interface MultiImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  imageSize: number;
  imageDescriptions?: Record<string, string[]> | string[]; // 支持多语言或单语言
  requirements?: Record<string, string> | string; // 支持多语言或单语言
  isLoggedIn: boolean;
  openLoginDialog: () => void;
  disabled?: boolean;
  currentLanguage?: string; // 当前语言，默认为 'zh'
  onGenerate?: () => void; // 手动触发生成的回调函数
  showGenerateButton?: boolean; // 是否显示生成按钮
}

export function MultiImageUploader({
  images,
  onImagesChange,
  imageSize,
  imageDescriptions = [],
  requirements,
  isLoggedIn,
  openLoginDialog,
  disabled = false,
  currentLanguage = 'zh',
  onGenerate,
  showGenerateButton = false,
}: MultiImageUploaderProps) {
  const { t } = useLocaleContext();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // 获取当前语言的requirements描述
  const getCurrentRequirements = (): string | undefined => {
    if (!requirements) return undefined;
    if (typeof requirements === 'string') return requirements;
    return requirements[currentLanguage] || requirements.zh || requirements.en || Object.values(requirements)[0];
  };

  // 获取当前语言的图片描述
  const getCurrentImageDescriptions = (): string[] => {
    if (!imageDescriptions) return [];
    if (Array.isArray(imageDescriptions)) return imageDescriptions;
    return (
      imageDescriptions[currentLanguage] ||
      imageDescriptions.zh ||
      imageDescriptions.en ||
      Object.values(imageDescriptions)[0] ||
      []
    );
  };

  const handleImageUpload = async (res: any, targetIndex: number) => {
    if (!res || !res.response || !res.response.data) {
      return;
    }

    const newImage = res.response.data.filename;
    const newImages = [...images];

    // 确保数组有足够的长度来设置目标位置
    while (newImages.length <= targetIndex) {
      newImages.push(''); // 用空字符串填充空位
    }

    // 直接在目标位置设置图片
    newImages[targetIndex] = newImage;

    onImagesChange(newImages);
    setUploadingIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = ''; // 设置为空字符串而不是删除元素
    onImagesChange(newImages);
  };

  // 计算有效图片数量（非空字符串）
  const validImageCount = images.filter((img) => img && img.trim() !== '').length;

  const slotsNeeded = imageSize;
  const currentRequirements = getCurrentRequirements();
  const currentDescriptions = getCurrentImageDescriptions();
  const isSingleImage = imageSize === 1;

  // 如果是单图片模式，使用专门的单图片上传组件，但保持与多图片模式相同的布局结构
  if (isSingleImage) {
    return (
      <SingleUploadArea elevation={4}>
        <SingleImageUploader
          onImageChange={(image) => onImagesChange(image ? [image] : [])}
          isLoggedIn={isLoggedIn}
          openLoginDialog={openLoginDialog}
          disabled={disabled}
          imageDescription={currentDescriptions[0]}
        />
      </SingleUploadArea>
    );
  }

  return (
    <Stack spacing={2}>
      {currentRequirements && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
          {currentRequirements}
        </Typography>
      )}

      <Box
        sx={{
          display: isSingleImage ? 'flex' : 'grid',
          flexDirection: isSingleImage ? 'column' : undefined,
          gridTemplateColumns: isSingleImage
            ? undefined
            : {
                xs: `repeat(${Math.min(2, slotsNeeded)}, 200px)`,
                sm: `repeat(${Math.min(3, slotsNeeded)}, 200px)`,
                md: `repeat(${Math.min(3, slotsNeeded)}, 200px)`,
              },
          gap: isSingleImage ? 2 : 3,
          alignItems: isSingleImage ? 'center' : 'start',
          justifyContent: 'center',
          justifyItems: isSingleImage ? undefined : 'center',
        }}>
        {Array.from({ length: slotsNeeded }, (_, index) => {
          const hasImage = index < images.length && images[index] && images[index]?.trim() !== '';
          const imageUrl = hasImage ? images[index] : null;
          const description = currentDescriptions[index];
          const isUploading = uploadingIndex === index;

          if (hasImage && imageUrl) {
            return (
              <Box key={index}>
                <ImagePreviewCard isSingle={isSingleImage}>
                  <img
                    src={getImageUrl(imageUrl)}
                    alt={`Uploaded content ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <DeleteButton className="delete-button" onClick={() => handleRemoveImage(index)} disabled={disabled}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </DeleteButton>
                  {/* Image number chip - hide for single image */}
                  {!isSingleImage && (
                    <Chip
                      label={`${index + 1}`}
                      size="small"
                      sx={(theme) => ({
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: `${theme.palette.primary.main}DD`,
                        color: theme.palette.common.white,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        height: 28,
                        backdropFilter: 'blur(4px)',
                        boxShadow: theme.shadows[2],
                        '& .MuiChip-label': {
                          paddingX: 1,
                        },
                      })}
                    />
                  )}
                </ImagePreviewCard>
                {description && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{
                      mt: 1,
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 600,
                      px: 1.5,
                      py: 0.5,
                      backgroundColor: (theme) => `${theme.palette.primary.main}10`,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      border: (theme) => `1px solid ${theme.palette.primary.main}30`,
                    }}>
                    {description}
                  </Typography>
                )}
              </Box>
            );
          }

          // Show upload slot for empty slots (up to imageSize)
          if (index < imageSize) {
            return (
              <Box key={index}>
                <UploadSlot isSingle={isSingleImage}>
                  <UploaderButton
                    isLoggedIn={isLoggedIn}
                    onChange={(res: any) => handleImageUpload(res, index)}
                    openLoginDialog={openLoginDialog}
                    disabled={disabled || isUploading}
                    // eslint-disable-next-line react/no-unstable-nested-components
                    customTrigger={(onClick) => (
                      <UploadTrigger
                        onClick={onClick}
                        isSingle={isSingleImage}
                        isUploading={isUploading}
                        description={description}
                        index={index}
                      />
                    )}
                  />
                </UploadSlot>
              </Box>
            );
          }

          return null;
        })}
      </Box>

      {/* Status chips - only show for multi-image case */}
      {!isSingleImage && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              label={t('home.uploader.imageCount', { current: validImageCount, total: imageSize })}
              color={validImageCount >= imageSize ? 'success' : 'default'}
              variant="filled"
              sx={(theme) => ({
                fontWeight: 500,
                fontSize: '0.8rem',
                backgroundColor:
                  validImageCount >= imageSize ? theme.palette.success.main : theme.palette.action.selected,
                color: validImageCount >= imageSize ? theme.palette.success.contrastText : theme.palette.text.primary,
                '& .MuiChip-label': {
                  px: 1.5,
                },
              })}
            />
          </Stack>
        </Box>
      )}
      {/* Single image status */}
      {isSingleImage && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
          <Chip
            size="small"
            label={t('home.uploader.imageCount', { current: validImageCount, total: 1 })}
            color={validImageCount >= imageSize ? 'success' : 'default'}
            variant="filled"
            sx={(theme) => ({
              fontWeight: 500,
              fontSize: '0.8rem',
              backgroundColor:
                validImageCount >= imageSize ? theme.palette.success.main : theme.palette.action.selected,
              color: validImageCount >= imageSize ? theme.palette.success.contrastText : theme.palette.text.primary,
              '& .MuiChip-label': {
                px: 1.5,
              },
            })}
          />
        </Stack>
      )}

      {/* 生成按钮 - 多图模式下始终显示 */}
      {showGenerateButton && !isSingleImage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AutoFixHighIcon />}
            onClick={onGenerate}
            disabled={disabled || validImageCount < imageSize}
            sx={(theme) => ({
              backgroundColor:
                validImageCount >= imageSize ? theme.palette.primary.main : theme.palette.action.disabledBackground,
              color: validImageCount >= imageSize ? theme.palette.primary.contrastText : theme.palette.action.disabled,
              fontWeight: 600,
              fontSize: '1.1rem',
              padding: '6px 32px',
              borderRadius: '50px',
              textTransform: 'none',
              boxShadow: validImageCount >= imageSize ? theme.shadows[4] : 'none',
              transition: 'all 0.3s ease',
              '&:hover':
                validImageCount >= imageSize
                  ? {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    }
                  : {},
              '&:active': {
                transform: validImageCount >= imageSize ? 'translateY(0)' : 'none',
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
                transform: 'none',
                boxShadow: 'none',
              },
            })}>
            {t('home.uploader.startGenerate')}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
