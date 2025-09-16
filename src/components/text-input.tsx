import ClearIcon from '@mui/icons-material/Clear';
import CreateIcon from '@mui/icons-material/Create';
import { Box, Button, Card, CardContent, Fade, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  requirements?: string;
  disabled?: boolean;
  isLoggedIn?: boolean;
  openLoginDialog?: () => void;
  onGenerate?: () => void;
  showGenerateButton?: boolean;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  requirements,
  disabled = false,
  isLoggedIn = false,
  openLoginDialog,
  onGenerate,
  showGenerateButton = false,
}: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (!isLoggedIn && openLoginDialog) {
      openLoginDialog();
      return;
    }
    if (onGenerate && value.trim()) {
      onGenerate();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 输入区域 */}
      <Card
        elevation={focused ? 8 : 2}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          borderRadius: '16px',
          border: focused ? `2px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            '&:last-child': { pb: 3 },
          }}>
          {/* 文本输入框 */}
          <TextField
            multiline
            rows={8}
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={requirements || placeholder || '请输入您的内容...'}
            disabled={disabled}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start',
                fontSize: '1rem',
                lineHeight: 1.6,
                border: 'none',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
                resize: 'none',
              },
            }}
          />

          {/* 操作提示 */}
          <Fade in={value.trim().length > 0 || focused}>
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                }}>
                Ctrl/Cmd + Enter 快速生成
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: value.trim().length > 10 ? theme.palette.success.main : theme.palette.text.disabled,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}>
                {value.trim().length} 字符
              </Typography>
            </Box>
          </Fade>
        </CardContent>
      </Card>

      {/* 按钮区域 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {/* 清除按钮 */}
        <Button
          variant="outlined"
          size="large"
          onClick={handleClear}
          disabled={disabled || !value.trim()}
          startIcon={<ClearIcon />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '50px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            borderColor: theme.palette.text.secondary,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              backgroundColor: `${theme.palette.error.main}08`,
            },
            '&:disabled': {
              borderColor: theme.palette.action.disabled,
              color: theme.palette.action.disabled,
            },
            transition: 'all 0.3s ease',
          }}>
          清除
        </Button>

        {/* 生成按钮 */}
        {showGenerateButton && (
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            startIcon={<CreateIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: theme.shadows[3],
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[6],
              },
              '&:disabled': {
                background: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
              transition: 'all 0.3s ease',
            }}>
            {!isLoggedIn ? '登录以开始生成' : '开始生成'}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default TextInput;
