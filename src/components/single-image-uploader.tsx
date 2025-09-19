import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, styled } from '@mui/material';

import { getImageUrl } from '../libs/utils';
import { UploaderButton } from './uploader';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  height: '200px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `2px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    '& .delete-button': {
      opacity: 1,
    },
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  right: 2,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'all 0.3s ease',
  width: 28,
  height: 28,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
}));

interface SingleImageUploaderProps {
  onImageChange: (image: string | null) => void;
  isLoggedIn: boolean;
  openLoginDialog: () => void;
  disabled?: boolean;
  imageDescription?: string;
  currentImage?: string | null;
  hasControlsConfig?: boolean;
}

export function SingleImageUploader({
  onImageChange,
  isLoggedIn,
  openLoginDialog,
  disabled = false,
  imageDescription,
  currentImage,
  hasControlsConfig = false,
}: SingleImageUploaderProps) {
  const handleImageUpload = async (res: any) => {
    if (!res || !res.response || !res.response.data) {
      return;
    }

    const newImage = res.response.data.filename;
    onImageChange(newImage);
  };

  const handleDeleteImage = () => {
    onImageChange(null);
  };

  // 如果有 controlsConfig 且已有图片，显示图片预览和删除按钮
  if (hasControlsConfig && currentImage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ImageContainer>
          <img
            src={getImageUrl(currentImage)}
            alt="已上传的图片"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <DeleteButton className="delete-button" onClick={handleDeleteImage} disabled={disabled}>
            <DeleteIcon sx={{ fontSize: 16 }} />
          </DeleteButton>
        </ImageContainer>
      </Box>
    );
  }

  // 如果没有图片，显示上传区域
  return (
    <UploaderButton
      isLoggedIn={isLoggedIn}
      onChange={handleImageUpload}
      openLoginDialog={openLoginDialog}
      disabled={disabled}
      title={imageDescription || undefined}
      hasControlsConfig={hasControlsConfig}
    />
  );
}
