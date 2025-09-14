import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import { Box, Card, Chip, IconButton, Stack, Typography, styled } from '@mui/material';
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
      spacing={isSingle ? 2 : 1.5}
      sx={{ p: isSingle ? 3 : 2, cursor: 'pointer', width: '100%', height: '100%' }}
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
        sx={{ fontWeight: 500, fontSize: isSingle ? '1rem' : '0.875rem' }}>
        {isUploading ? 'Uploading...' : `Upload ${index + 1}`}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          color="primary.main"
          textAlign="center"
          sx={{
            fontWeight: 500,
            fontSize: isSingle ? '0.8rem' : '0.7rem',
            px: 1,
            py: 0.5,
            border: '1px dashed',
            borderColor: 'primary.main',
            borderRadius: 1,
            backgroundColor: (theme) => `${theme.palette.primary.main}08`,
          }}>
          {description}
        </Typography>
      )}
    </Stack>
  );
}

const ImagePreviewCard = styled(Card)<{ isSingle?: boolean }>(({ theme, isSingle }) => ({
  position: 'relative',
  aspectRatio: '1',
  maxWidth: isSingle ? 320 : 200,
  maxHeight: isSingle ? 320 : 200,
  width: isSingle ? '100%' : undefined,
  overflow: 'hidden',
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: `${theme.palette.error.main}E6`,
  color: theme.palette.common.white,
  width: 28,
  height: 28,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.error.main,
    transform: 'scale(1.1)',
  },
}));

const UploadSlot = styled(Card)<{ isSingle?: boolean }>(({ theme, isSingle }) => ({
  aspectRatio: '1',
  maxWidth: isSingle ? 320 : 200,
  maxHeight: isSingle ? 320 : 200,
  width: isSingle ? '100%' : undefined,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
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
  maxImages: number;
  minImages?: number;
  imageDescriptions?: Record<string, string[]> | string[]; // 支持多语言或单语言
  requirements?: Record<string, string> | string; // 支持多语言或单语言
  isLoggedIn: boolean;
  openLoginDialog: () => void;
  disabled?: boolean;
  currentLanguage?: string; // 当前语言，默认为 'zh'
}

export function MultiImageUploader({
  images,
  onImagesChange,
  maxImages,
  minImages = 1,
  imageDescriptions = [],
  requirements,
  isLoggedIn,
  openLoginDialog,
  disabled = false,
  currentLanguage = 'zh',
}: MultiImageUploaderProps) {
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

    if (targetIndex < newImages.length) {
      // Replace existing image
      newImages[targetIndex] = newImage;
    } else {
      // Add new image
      newImages.push(newImage);
    }

    onImagesChange(newImages);
    setUploadingIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;
  const slotsNeeded = Math.max(minImages, images.length + (canAddMore ? 1 : 0));
  const currentRequirements = getCurrentRequirements();
  const currentDescriptions = getCurrentImageDescriptions();
  const isSingleImage = maxImages === 1 && minImages === 1;

  // 如果是单图片模式，使用专门的单图片上传组件，但保持与多图片模式相同的布局结构
  if (isSingleImage) {
    return (
      <SingleUploadArea elevation={4}>
        <SingleImageUploader
          image={images[0] || null}
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
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {currentRequirements}
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: isSingleImage ? 'column' : { xs: 'column', sm: 'row' },
          gap: 2,
          flexWrap: 'wrap',
          alignItems: isSingleImage ? 'center' : 'flex-start',
          justifyContent: isSingleImage ? 'center' : 'flex-start',
        }}>
        {Array.from({ length: slotsNeeded }, (_, index) => {
          const hasImage = index < images.length;
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
                        top: 8,
                        left: 8,
                        background: `${theme.palette.primary.main}E6`,
                        color: theme.palette.common.white,
                        fontWeight: 'bold',
                      })}
                    />
                  )}
                </ImagePreviewCard>
                {description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 500,
                      px: 1,
                    }}>
                    {description}
                  </Typography>
                )}
              </Box>
            );
          }

          // Show upload slot for empty slots (up to maxImages)
          if (index < maxImages) {
            return (
              <Box key={index}>
                <UploadSlot isSingle={isSingleImage} sx={description ? { minHeight: '220px' } : {}}>
                  <UploaderButton
                    isLoggedIn={isLoggedIn}
                    onChange={(res) => handleImageUpload(res, index)}
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
                {!description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                    Click to upload image {index + 1}
                  </Typography>
                )}
              </Box>
            );
          }

          return null;
        })}
      </Box>

      {/* Status chips - only show for multi-image case */}
      {!isSingleImage && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            size="small"
            label={`${images.length} / ${maxImages} images`}
            color={images.length >= minImages ? 'success' : 'warning'}
          />
          {minImages > 1 && images.length < minImages && (
            <Chip size="small" label={`${minImages - images.length} more required`} color="warning" />
          )}
        </Stack>
      )}
      {/* Single image status */}
      {isSingleImage && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
          <Chip
            size="small"
            label={images.length === 0 ? '0 / 1 images' : '1 / 1 images'}
            color={images.length >= minImages ? 'success' : 'default'}
          />
        </Stack>
      )}
    </Stack>
  );
}
