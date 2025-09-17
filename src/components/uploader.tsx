// src/contexts/uploader.tsx，封装的 Provider 方案
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Button, Stack, Typography, styled } from '@mui/material';
import { ReactNode, createContext, lazy, useContext, useRef } from 'react';

// @ts-ignore
const UploaderComponent = lazy(() => import('@blocklet/uploader/react').then((res) => ({ default: res.Uploader })));

// 样式化的上传按钮，与 home.tsx 中的 GoldenButton 保持一致
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

interface UploaderProviderProps {
  children: ReactNode;
}

export const UploaderContext = createContext(null);

// Provider 方案
export function useUploader() {
  const uploaderRef = useContext(UploaderContext);
  if (!uploaderRef) {
    throw new Error('useUploader must be used within an UploaderProvider');
  }
  return uploaderRef;
}

// 前端触发打开 Uploader 的组件，完整的上传区域布局
export function UploaderButton({
  onChange = undefined,
  openLoginDialog,
  isLoggedIn,
  title,
  description,
  buttonText,
  compact = false,
  customTrigger,
  disabled = false,
}: {
  openLoginDialog: Function;
  onChange?: Function;
  isLoggedIn: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  compact?: boolean;
  customTrigger?: (onClick: () => void) => ReactNode;
  disabled?: boolean;
}) {
  const { t } = useLocaleContext();
  const uploaderRef = useUploader();

  const handleClick = () => {
    if (disabled) return;

    if (isLoggedIn) {
      handleOpen();
    } else {
      openLoginDialog();
    }
  };

  const handleOpen = () => {
    // @ts-ignore
    const uploaderState = uploaderRef?.current;

    uploaderState?.open();

    if (onChange) {
      // @ts-ignore
      const uploader = uploaderRef?.current?.getUploader();

      // emit to upload success, mock http response
      uploader.onceUploadSuccess((res: any) => {
        onChange(res);
        uploader.close();
      });
    }
  };

  // 如果提供了自定义触发器，直接返回它
  if (customTrigger) {
    return <>{customTrigger(handleClick)}</>;
  }

  if (compact) {
    return (
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleClick}
        disabled={disabled}
        sx={{
          borderRadius: '8px',
          textTransform: 'none',
          opacity: disabled ? 0.6 : 1,
        }}>
        {buttonText || t('home.uploader.selectButton')}
      </Button>
    );
  }

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
      <PhotoCameraIcon
        sx={(theme) => ({
          fontSize: { xs: 48, sm: 60 },
          color: theme.palette.primary.main,
          filter: `drop-shadow(0 4px 8px ${theme.palette.primary.main}30)`,
        })}
      />

      <Typography
        variant="h5"
        textAlign="center"
        sx={(theme) => ({
          color: theme.palette.text.primary,
          fontWeight: 300,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        })}>
        {title || t('home.uploader.title')}
      </Typography>

      <Typography
        variant="body2"
        textAlign="center"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          lineHeight: 1.6,
        })}>
        {description || `${t('home.uploader.clickToSelect')}\n${t('home.uploader.description')}`}
      </Typography>

      <GoldenButton
        size="large"
        startIcon={<CloudUploadIcon />}
        onClick={handleClick}
        disabled={disabled}
        sx={{
          fontSize: { xs: '0.875rem', sm: '1.1rem' },
          px: { xs: 2, sm: 4 },
          py: { xs: 1, sm: 1.5 },
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        {buttonText || t('home.uploader.selectButton')}
      </GoldenButton>
    </Stack>
  );
}

// Provider，需要包裹在 StyledProvider 后面
export default function UploaderProvider({ children }: UploaderProviderProps) {
  const uploaderRef = useRef(null);

  const onClose = () => {
    try {
      setTimeout(() => {
        // 关闭组件默认清除任务（包括上传中的任务，因为 Pages Kit 不需要后台上传的逻辑）
        // @ts-ignore
        uploaderRef?.current?.getUploader().cancelAll();
      }, 200);
    } catch (error) {
      // do nothing
    }
  };

  return (
    <UploaderContext.Provider value={uploaderRef as any}>
      {children}
      <UploaderComponent
        // @ts-ignore
        onClose={onClose} // 关闭后触发什么
        key="uploader"
        ref={uploaderRef} // ref
        popup
        coreProps={{
          // 上传限制，参考 https://uppy.io/docs/uppy/#restrictions
          restrictions: {
            allowedFileTypes: ['image/png', 'image/jpeg'],
            maxNumberOfFiles: 1,
            maxFileSize: 1024 * 1024 * 10, // Override to 10MB
          },
        }}
      />
    </UploaderContext.Provider>
  );
}
