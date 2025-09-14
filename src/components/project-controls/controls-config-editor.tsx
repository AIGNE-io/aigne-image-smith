import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import MultiLanguageEditor from '../multi-language-editor';
import MultiLanguageImageDescriptionsEditor from '../multi-language-image-descriptions-editor';
import { SUPPORTED_LANGUAGES } from '../project-content-editor';
import type {
  BackgroundSelectorControlConfig,
  ControlConfig,
  NumberInputControlConfig,
  ProjectControlsConfig,
  SelectControlConfig,
  SliderControlConfig,
  TextInputControlConfig,
} from './types';

interface ControlsConfigEditorProps {
  config: ProjectControlsConfig;
  onChange: (config: ProjectControlsConfig) => void;
  disabled?: boolean;
}

const CONTROL_TYPES = [
  { value: 'select', label: 'Select Dropdown' },
  { value: 'slider', label: 'Slider' },
  { value: 'number', label: 'Number Input' },
  { value: 'text', label: 'Text Input' },
  { value: 'backgroundSelector', label: 'Background Selector' },
];

// Initialize empty values for all supported languages
const createEmptyLanguageObject = () => {
  const obj: Record<string, string> = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    obj[lang.code] = '';
  });
  return obj;
};

const createEmptyImageDescriptionsObject = () => {
  const obj: Record<string, string[]> = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    obj[lang.code] = [];
  });
  return obj;
};

const DEFAULT_CONTROLS: { [key: string]: Partial<ControlConfig> } = {
  select: {
    type: 'select',
    options: [{ value: 'option1', label: 'Option 1' }],
  },
  slider: {
    type: 'slider',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
  },
  number: {
    type: 'number',
    min: 0,
    max: 1000,
    step: 1,
  },
  text: {
    type: 'text',
    placeholder: 'Enter text...',
  },
  backgroundSelector: {
    type: 'backgroundSelector',
    backgrounds: [
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'blue', label: 'Blue', color: '#1565C0' },
    ],
  },
};

function ControlConfigEditor({
  controlConfig,
  onChange,
  onDelete,
}: {
  controlConfig: ControlConfig;
  onChange: (config: ControlConfig) => void;
  onDelete: () => void;
}) {
  const updateConfig = (updates: Partial<ControlConfig>) => {
    onChange({ ...controlConfig, ...updates });
  };

  const renderTypeSpecificFields = () => {
    switch (controlConfig.type) {
      case 'select': {
        const selectConfig = controlConfig as SelectControlConfig;
        return (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={selectConfig.multiple || false}
                  onChange={(e) => updateConfig({ multiple: e.target.checked })}
                />
              }
              label="Allow multiple selection"
            />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Options:</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newOptions = [
                      ...(selectConfig.options || []),
                      { value: `option${(selectConfig.options?.length || 0) + 1}`, label: 'New Option' },
                    ];
                    updateConfig({ options: newOptions });
                  }}>
                  Add Option
                </Button>
              </Stack>
              <Stack spacing={1}>
                {(selectConfig.options || []).map((option, index) => (
                  <Stack
                    key={`option-${option.value || 'empty'}-${option.label || 'empty'}`}
                    direction="row"
                    spacing={1}
                    alignItems="center">
                    <TextField
                      size="small"
                      label="Value"
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [...selectConfig.options];
                        newOptions[index] = { ...option, value: e.target.value };
                        updateConfig({ options: newOptions });
                      }}
                    />
                    <TextField
                      size="small"
                      label="Label"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...selectConfig.options];
                        newOptions[index] = { ...option, label: e.target.value };
                        updateConfig({ options: newOptions });
                      }}
                    />
                    <TextField
                      size="small"
                      label="Color (optional)"
                      value={option.color || ''}
                      onChange={(e) => {
                        const newOptions = [...selectConfig.options];
                        newOptions[index] = { ...option, color: e.target.value };
                        updateConfig({ options: newOptions });
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newOptions = selectConfig.options.filter((_, i) => i !== index);
                        updateConfig({ options: newOptions });
                      }}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </>
        );
      }

      case 'slider': {
        const sliderConfig = controlConfig as SliderControlConfig;
        return (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Value"
              type="number"
              value={sliderConfig.min || 0}
              onChange={(e) => updateConfig({ min: Number(e.target.value) })}
            />
            <TextField
              label="Max Value"
              type="number"
              value={sliderConfig.max || 100}
              onChange={(e) => updateConfig({ max: Number(e.target.value) })}
            />
            <TextField
              label="Step"
              type="number"
              value={sliderConfig.step || 1}
              onChange={(e) => updateConfig({ step: Number(e.target.value) })}
            />
          </Stack>
        );
      }

      case 'number': {
        const numberConfig = controlConfig as NumberInputControlConfig;
        return (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Value (optional)"
              type="number"
              value={numberConfig.min || ''}
              onChange={(e) => updateConfig({ min: e.target.value ? Number(e.target.value) : undefined })}
            />
            <TextField
              label="Max Value (optional)"
              type="number"
              value={numberConfig.max || ''}
              onChange={(e) => updateConfig({ max: e.target.value ? Number(e.target.value) : undefined })}
            />
            <TextField
              label="Unit (optional)"
              value={numberConfig.unit || ''}
              onChange={(e) => updateConfig({ unit: e.target.value })}
            />
          </Stack>
        );
      }

      case 'text': {
        const textConfig = controlConfig as TextInputControlConfig;
        return (
          <>
            <TextField
              label="Placeholder"
              value={textConfig.placeholder || ''}
              onChange={(e) => updateConfig({ placeholder: e.target.value })}
              fullWidth
            />
            <TextField
              label="Max Length (optional)"
              type="number"
              value={textConfig.maxLength || ''}
              onChange={(e) => updateConfig({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </>
        );
      }

      case 'backgroundSelector': {
        const bgConfig = controlConfig as BackgroundSelectorControlConfig;
        return (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Background Options:</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newBackgrounds = [
                    ...(bgConfig.backgrounds || []),
                    {
                      value: `bg${(bgConfig.backgrounds?.length || 0) + 1}`,
                      label: 'New Background',
                      color: '#FFFFFF',
                    },
                  ];
                  updateConfig({ backgrounds: newBackgrounds });
                }}>
                Add Background
              </Button>
            </Stack>
            <Stack spacing={1}>
              {(bgConfig.backgrounds || []).map((bg, index) => (
                <Stack
                  key={`bg-${bg.value || 'empty'}-${bg.color || 'empty'}`}
                  direction="row"
                  spacing={1}
                  alignItems="center">
                  <TextField
                    size="small"
                    label="Value"
                    value={bg.value}
                    onChange={(e) => {
                      const newBackgrounds = [...bgConfig.backgrounds];
                      newBackgrounds[index] = { ...bg, value: e.target.value };
                      updateConfig({ backgrounds: newBackgrounds });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Label"
                    value={bg.label}
                    onChange={(e) => {
                      const newBackgrounds = [...bgConfig.backgrounds];
                      newBackgrounds[index] = { ...bg, label: e.target.value };
                      updateConfig({ backgrounds: newBackgrounds });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Color"
                    value={bg.color}
                    onChange={(e) => {
                      const newBackgrounds = [...bgConfig.backgrounds];
                      newBackgrounds[index] = { ...bg, color: e.target.value };
                      updateConfig({ backgrounds: newBackgrounds });
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: bg.color,
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newBackgrounds = bgConfig.backgrounds.filter((_, i) => i !== index);
                      updateConfig({ backgrounds: newBackgrounds });
                    }}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip label={controlConfig.type} size="small" />
          <Typography>{controlConfig.label || 'Untitled Control'}</Typography>
          <Typography variant="caption" color="text.secondary">
            Key: {controlConfig.key}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Control Key"
              value={controlConfig.key}
              onChange={(e) => updateConfig({ key: e.target.value })}
              helperText="Used in prompt template as {{key}}"
              required
            />
            <TextField
              label="Label"
              value={controlConfig.label}
              onChange={(e) => updateConfig({ label: e.target.value })}
              required
            />
          </Stack>

          <TextField
            label="Description (optional)"
            value={controlConfig.description || ''}
            onChange={(e) => updateConfig({ description: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={controlConfig.required || false}
                onChange={(e) => updateConfig({ required: e.target.checked })}
              />
            }
            label="Required field"
          />

          {renderTypeSpecificFields()}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
              Remove Control
            </Button>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export function ControlsConfigEditor({ config, onChange, disabled = false }: ControlsConfigEditorProps) {
  const [newControlType, setNewControlType] = useState('select');

  const updateInputConfig = (updates: Partial<typeof config.inputConfig>) => {
    onChange({
      ...config,
      inputConfig: { ...config.inputConfig, ...updates },
    });
  };

  const addControl = () => {
    const baseConfig = {
      key: `control_${Date.now()}`,
      label: 'New Control',
      ...DEFAULT_CONTROLS[newControlType],
    };

    onChange({
      ...config,
      controlsConfig: [...config.controlsConfig, baseConfig as ControlConfig],
    });
  };

  const updateControl = (index: number, controlConfig: ControlConfig) => {
    const newControlsConfig = [...config.controlsConfig];
    newControlsConfig[index] = controlConfig;
    onChange({
      ...config,
      controlsConfig: newControlsConfig,
    });
  };

  const removeControl = (index: number) => {
    onChange({
      ...config,
      controlsConfig: config.controlsConfig.filter((_, i) => i !== index),
    });
  };

  return (
    <Stack spacing={3}>
      {/* Input Configuration */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Input Configuration
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Maximum Images"
                type="number"
                value={config.inputConfig.maxImages}
                onChange={(e) => updateInputConfig({ maxImages: Number(e.target.value) })}
                disabled={disabled}
                inputProps={{ min: 1, max: 10 }}
                helperText="How many images can be uploaded"
              />
              <TextField
                label="Minimum Images (optional)"
                type="number"
                value={config.inputConfig.minImages || ''}
                onChange={(e) => updateInputConfig({ minImages: e.target.value ? Number(e.target.value) : undefined })}
                disabled={disabled}
                inputProps={{ min: 1 }}
              />
            </Stack>

            {/* Requirements Description - Multi-language */}
            <MultiLanguageEditor
              label="Requirements Description"
              values={config.inputConfig.requirements || createEmptyLanguageObject()}
              onChange={(values) => {
                // Check if any value has content, if not set to undefined
                const hasContent = Object.values(values).some((v) => v?.trim());
                updateInputConfig({ requirements: hasContent ? values : undefined });
              }}
              disabled={disabled}
              multiline
              rows={2}
              placeholder="Describe image requirements to users..."
              helperText="Describe image requirements to users in different languages"
            />

            {/* Image Descriptions Configuration - Multi-language */}
            <MultiLanguageImageDescriptionsEditor
              values={config.inputConfig.imageDescriptions || createEmptyImageDescriptionsObject()}
              onChange={(values) => {
                // Check if any language has descriptions (even empty ones), if not set to undefined
                const hasDescriptions = Object.values(values).some((descriptions) => descriptions.length > 0);
                updateInputConfig({ imageDescriptions: hasDescriptions ? values : undefined });
              }}
              maxImages={config.inputConfig.maxImages}
              disabled={disabled}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Controls Configuration */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">Control Components</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select value={newControlType} onChange={(e) => setNewControlType(e.target.value)} disabled={disabled}>
                  {CONTROL_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addControl} disabled={disabled}>
                Add Control
              </Button>
            </Stack>
          </Stack>

          {config.controlsConfig.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No control components configured. Add some to provide users with customization options.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {config.controlsConfig.map((controlConfig, index) => (
                <ControlConfigEditor
                  key={`control-${controlConfig.key || 'empty'}-${controlConfig.type || 'unknown'}`}
                  controlConfig={controlConfig}
                  onChange={(newConfig) => updateControl(index, newConfig)}
                  onDelete={() => removeControl(index)}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
