import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';

import { BackgroundSelector } from '../background-selector';
import type {
  BackgroundSelectorControlConfig,
  ControlConfig,
  ControlValues,
  NumberInputControlConfig,
  SelectControlConfig,
  SliderControlConfig,
  TextInputControlConfig,
} from './types';

const ControlCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

interface ControlRendererProps {
  config: ControlConfig;
  value: any;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export function ControlRenderer({ config, value, onChange, disabled = false }: ControlRendererProps) {
  const handleChange = (newValue: any) => {
    onChange(config.key, newValue);
  };

  const renderControl = () => {
    switch (config.type) {
      case 'select': {
        const selectConfig = config as SelectControlConfig;
        return (
          <FormControl fullWidth>
            <Select
              value={value || selectConfig.defaultValue || ''}
              onChange={(e: SelectChangeEvent) => handleChange(e.target.value)}
              disabled={disabled}
              multiple={selectConfig.multiple}
              renderValue={
                selectConfig.multiple
                  ? (selected: any) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((val) => {
                          const option = selectConfig.options.find((opt) => opt.value === val);
                          return <Chip key={val} label={option?.label || val} size="small" />;
                        })}
                      </Box>
                    )
                  : undefined
              }>
              {selectConfig.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {option.color && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: option.color,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      />
                    )}
                    <Typography>{option.label}</Typography>
                  </Stack>
                  {option.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {option.description}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      case 'slider': {
        const sliderConfig = config as SliderControlConfig;
        return (
          <Box sx={{ px: 1 }}>
            <Slider
              value={value || sliderConfig.defaultValue || sliderConfig.min}
              onChange={(_, newValue) => handleChange(newValue)}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step || 1}
              marks={sliderConfig.marks}
              valueLabelDisplay="auto"
              disabled={disabled}
            />
          </Box>
        );
      }

      case 'number': {
        const numberConfig = config as NumberInputControlConfig;
        return (
          <TextField
            type="number"
            value={value || numberConfig.defaultValue || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            inputProps={{
              min: numberConfig.min,
              max: numberConfig.max,
              step: numberConfig.step || 1,
            }}
            disabled={disabled}
            fullWidth
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              endAdornment: numberConfig.unit ? (
                <Typography variant="body2" color="text.secondary">
                  {numberConfig.unit}
                </Typography>
              ) : undefined,
            }}
          />
        );
      }

      case 'text': {
        const textConfig = config as TextInputControlConfig;
        return (
          <TextField
            value={value || textConfig.defaultValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={textConfig.placeholder}
            inputProps={{
              maxLength: textConfig.maxLength,
            }}
            disabled={disabled}
            fullWidth
          />
        );
      }

      case 'backgroundSelector': {
        const bgConfig = config as BackgroundSelectorControlConfig;
        return (
          <BackgroundSelector
            selectedBackground={value || bgConfig.defaultValue || bgConfig.backgrounds[0]?.value || ''}
            onBackgroundChange={handleChange}
            backgrounds={bgConfig.backgrounds}
          />
        );
      }

      default:
        return <Typography color="error">Unsupported control type: {config.type}</Typography>;
    }
  };

  return (
    <ControlCard elevation={1}>
      <FormControl fullWidth>
        <FormLabel sx={{ mb: 1.5, fontWeight: 500, fontSize: '0.95rem' }}>
          {config.label}
          {config.required && <span style={{ color: '#f44336', marginLeft: 4 }}>*</span>}
        </FormLabel>
        {config.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', lineHeight: 1.4 }}>
            {config.description}
          </Typography>
        )}
        {renderControl()}
      </FormControl>
    </ControlCard>
  );
}

interface ProjectControlsProps {
  controlsConfig: ControlConfig[];
  values: ControlValues;
  onChange: (values: ControlValues) => void;
  disabled?: boolean;
}

export function ProjectControls({ controlsConfig, values, onChange, disabled = false }: ProjectControlsProps) {
  const handleControlChange = (key: string, value: any) => {
    const newValues = { ...values, [key]: value };
    onChange(newValues);
  };

  if (controlsConfig.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {controlsConfig.map((config) => (
        <ControlRenderer
          key={config.key}
          config={config}
          value={values[config.key]}
          onChange={handleControlChange}
          disabled={disabled}
        />
      ))}
    </Stack>
  );
}
