import PaletteIcon from '@mui/icons-material/Palette';
import { Box, Stack, Typography, styled } from '@mui/material';

const SelectorCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  padding: theme.spacing(2),
  // border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  minHeight: '120px',
}));

const BackgroundOptionBox = styled(Box)<{ selected: boolean; bgColor: string }>(({ theme, selected, bgColor }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: selected ? `3px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
  backgroundColor: bgColor,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: selected ? theme.shadows[3] : theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
    border: `2px solid ${theme.palette.primary.main}80`,
  },
  '&::after': selected
    ? {
        content: '"✓"',
        position: 'absolute',
        color: bgColor === '#FFFFFF' ? theme.palette.common.black : theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: '16px',
        textShadow: bgColor === '#FFFFFF' ? 'none' : `0 0 4px ${theme.palette.common.black}`,
      }
    : undefined,
}));

export interface BackgroundOption {
  value: string;
  label: string;
  color: string;
}

export const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  { value: 'white', label: 'White', color: '#FFFFFF' },
  { value: 'blue', label: 'Blue', color: '#1565C0' },
  { value: 'red', label: 'Red', color: '#C62828' },
  { value: 'gray', label: 'Gray', color: '#424242' },
];

interface BackgroundSelectorProps {
  selectedBackground: string;
  onBackgroundChange: (backgroundValue: string) => void;
  backgrounds?: BackgroundOption[];
  title?: string;
  showTitle?: boolean;
}

export function BackgroundSelector({
  selectedBackground,
  onBackgroundChange,
  backgrounds = DEFAULT_BACKGROUNDS,
  title = 'Background Color',
  showTitle = true,
}: BackgroundSelectorProps) {
  return (
    <SelectorCard>
      <Stack spacing={2}>
        {showTitle && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <PaletteIcon
              sx={(theme) => ({
                color: theme.palette.primary.main,
                fontSize: 20,
              })}
            />
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                fontWeight: 600,
                color: theme.palette.text.primary,
              })}>
              {title}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
          {backgrounds.map((bg) => (
            <Stack key={bg.value} spacing={0.5} alignItems="center">
              <BackgroundOptionBox
                selected={selectedBackground === bg.value}
                bgColor={bg.color}
                onClick={() => onBackgroundChange(bg.value)}
              />
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                  textAlign: 'center',
                })}>
                {bg.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </SelectorCard>
  );
}

export default BackgroundSelector;
