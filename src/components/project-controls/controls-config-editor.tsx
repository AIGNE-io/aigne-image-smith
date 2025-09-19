import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
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
  showOnlyRequirements?: boolean;
}

const getControlTypes = (t: (key: string) => string) => [
  { value: 'select', label: t('components.controlsConfigEditor.controlComponents.types.select') },
  { value: 'slider', label: t('components.controlsConfigEditor.controlComponents.types.slider') },
  { value: 'number', label: t('components.controlsConfigEditor.controlComponents.types.number') },
  { value: 'text', label: t('components.controlsConfigEditor.controlComponents.types.text') },
  {
    value: 'backgroundSelector',
    label: t('components.controlsConfigEditor.controlComponents.types.backgroundSelector'),
  },
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
    options: [{ value: 'option1', label: createEmptyLanguageObject() }],
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
    placeholder: createEmptyLanguageObject(),
  },
  backgroundSelector: {
    type: 'backgroundSelector',
    backgrounds: [
      { value: 'white', label: createEmptyLanguageObject(), color: '#FFFFFF' },
      { value: 'blue', label: createEmptyLanguageObject(), color: '#1565C0' },
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
  const { t } = useLocaleContext();
  const updateConfig = (updates: Partial<ControlConfig>) => {
    onChange({ ...controlConfig, ...updates } as ControlConfig);
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
              label={t('components.controlsConfigEditor.controlConfig.select.allowMultiple')}
            />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {t('components.controlsConfigEditor.controlConfig.select.options')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newOptions = [
                      ...(selectConfig.options || []),
                      { value: `option${(selectConfig.options?.length || 0) + 1}`, label: createEmptyLanguageObject() },
                    ];
                    updateConfig({ options: newOptions });
                  }}>
                  {t('components.controlsConfigEditor.controlConfig.select.addOption')}
                </Button>
              </Stack>
              <Stack spacing={1}>
                {(selectConfig.options || []).map((option, index) => (
                  <Box key={`option-${index}`} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          label={t('components.controlsConfigEditor.controlConfig.select.optionValue')}
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...selectConfig.options];
                            newOptions[index] = { ...option, value: e.target.value };
                            updateConfig({ options: newOptions });
                          }}
                        />
                        <TextField
                          size="small"
                          label={t('components.controlsConfigEditor.controlConfig.select.optionColor')}
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
                      <MultiLanguageEditor
                        label={t('components.controlsConfigEditor.controlConfig.select.optionLabel')}
                        values={
                          typeof option.label === 'string'
                            ? { en: option.label }
                            : option.label || createEmptyLanguageObject()
                        }
                        onChange={(values) => {
                          const newOptions = [...selectConfig.options];
                          const hasContent = Object.values(values).some((v) => v?.trim());
                          newOptions[index] = { ...option, label: hasContent ? values : createEmptyLanguageObject() };
                          updateConfig({ options: newOptions });
                        }}
                      />
                    </Stack>
                  </Box>
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
              label={t('components.controlsConfigEditor.controlConfig.slider.minValue')}
              type="number"
              value={sliderConfig.min || 0}
              onChange={(e) => updateConfig({ min: Number(e.target.value) })}
            />
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.slider.maxValue')}
              type="number"
              value={sliderConfig.max || 100}
              onChange={(e) => updateConfig({ max: Number(e.target.value) })}
            />
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.slider.step')}
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
              label={t('components.controlsConfigEditor.controlConfig.number.minValue')}
              type="number"
              value={numberConfig.min || ''}
              onChange={(e) => updateConfig({ min: e.target.value ? Number(e.target.value) : undefined })}
            />
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.number.maxValue')}
              type="number"
              value={numberConfig.max || ''}
              onChange={(e) => updateConfig({ max: e.target.value ? Number(e.target.value) : undefined })}
            />
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.number.unit')}
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
            <MultiLanguageEditor
              label={t('components.controlsConfigEditor.controlConfig.text.placeholder')}
              values={
                typeof textConfig.placeholder === 'string'
                  ? { en: textConfig.placeholder }
                  : textConfig.placeholder || createEmptyLanguageObject()
              }
              onChange={(values) => {
                const hasContent = Object.values(values).some((v) => v?.trim());
                updateConfig({ placeholder: hasContent ? values : undefined });
              }}
            />
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.text.maxLength')}
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
              <Typography variant="subtitle2">
                {t('components.controlsConfigEditor.controlConfig.backgroundSelector.options')}
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newBackgrounds = [
                    ...(bgConfig.backgrounds || []),
                    {
                      value: `bg${(bgConfig.backgrounds?.length || 0) + 1}`,
                      label: createEmptyLanguageObject(),
                      color: '#FFFFFF',
                    },
                  ];
                  updateConfig({ backgrounds: newBackgrounds });
                }}>
                {t('components.controlsConfigEditor.controlConfig.backgroundSelector.addBackground')}
              </Button>
            </Stack>
            <Stack spacing={1}>
              {(bgConfig.backgrounds || []).map((bg, index) => (
                <Box key={`bg-${index}`} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        label={t('components.controlsConfigEditor.controlConfig.backgroundSelector.value')}
                        value={bg.value}
                        onChange={(e) => {
                          const newBackgrounds = [...bgConfig.backgrounds];
                          newBackgrounds[index] = { ...bg, value: e.target.value };
                          updateConfig({ backgrounds: newBackgrounds });
                        }}
                      />
                      <TextField
                        size="small"
                        label={t('components.controlsConfigEditor.controlConfig.backgroundSelector.color')}
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
                    <MultiLanguageEditor
                      label={t('components.controlsConfigEditor.controlConfig.backgroundSelector.label')}
                      values={typeof bg.label === 'string' ? { en: bg.label } : bg.label || createEmptyLanguageObject()}
                      onChange={(values) => {
                        const newBackgrounds = [...bgConfig.backgrounds];
                        const hasContent = Object.values(values).some((v) => v?.trim());
                        newBackgrounds[index] = { ...bg, label: hasContent ? values : createEmptyLanguageObject() };
                        updateConfig({ backgrounds: newBackgrounds });
                      }}
                    />
                  </Stack>
                </Box>
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
          <Typography>
            {typeof controlConfig.label === 'string'
              ? controlConfig.label
              : controlConfig.label?.['zh-CN'] ||
                controlConfig.label?.en ||
                Object.values(controlConfig.label || {})[0] ||
                t('components.controlsConfigEditor.controlConfig.untitled')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Key: {controlConfig.key}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label={t('components.controlsConfigEditor.controlConfig.key.label')}
              value={controlConfig.key}
              onChange={(e) => updateConfig({ key: e.target.value })}
              helperText={t('components.controlsConfigEditor.controlConfig.key.helperText')}
              required
            />
          </Stack>

          <MultiLanguageEditor
            label={t('components.controlsConfigEditor.controlConfig.label.label')}
            values={
              typeof controlConfig.label === 'string'
                ? { en: controlConfig.label }
                : controlConfig.label || createEmptyLanguageObject()
            }
            onChange={(values) => {
              const hasContent = Object.values(values).some((v) => v?.trim());
              updateConfig({ label: hasContent ? values : createEmptyLanguageObject() });
            }}
            required
          />

          <MultiLanguageEditor
            label={t('components.controlsConfigEditor.controlConfig.description.label')}
            values={
              typeof controlConfig.description === 'string'
                ? { en: controlConfig.description }
                : controlConfig.description || createEmptyLanguageObject()
            }
            onChange={(values) => {
              const hasContent = Object.values(values).some((v) => v?.trim());
              updateConfig({ description: hasContent ? values : undefined });
            }}
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Switch
                checked={controlConfig.required || false}
                onChange={(e) => updateConfig({ required: e.target.checked })}
              />
            }
            label={t('components.controlsConfigEditor.controlConfig.required')}
          />

          {renderTypeSpecificFields()}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
              {t('components.controlsConfigEditor.controlConfig.removeControl')}
            </Button>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export function ControlsConfigEditor({
  config,
  onChange,
  disabled = false,
  showOnlyRequirements = false,
}: ControlsConfigEditorProps) {
  const { t } = useLocaleContext();
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
      label: createEmptyLanguageObject(),
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
            {t('components.controlsConfigEditor.inputConfiguration.title')}
          </Typography>
          <Stack spacing={2}>
            {!showOnlyRequirements && (
              <TextField
                label={t('components.controlsConfigEditor.inputConfiguration.imageSize.label')}
                type="number"
                value={config.inputConfig.imageSize}
                onChange={(e) => updateInputConfig({ imageSize: Number(e.target.value) })}
                disabled={disabled}
                inputProps={{ min: 1, max: 10 }}
                helperText={t('components.controlsConfigEditor.inputConfiguration.imageSize.helperText')}
                sx={{ maxWidth: 300 }}
              />
            )}

            {/* Requirements Description - Multi-language */}
            <MultiLanguageEditor
              label={t('components.controlsConfigEditor.inputConfiguration.requirements.label')}
              values={config.inputConfig.requirements || createEmptyLanguageObject()}
              onChange={(values) => {
                // Check if any value has content, if not set to undefined
                const hasContent = Object.values(values).some((v) => v?.trim());
                updateInputConfig({ requirements: hasContent ? values : undefined });
              }}
              disabled={disabled}
              multiline
              rows={2}
              placeholder={
                showOnlyRequirements
                  ? t('components.controlsConfigEditor.inputConfiguration.requirements.placeholderText')
                  : t('components.controlsConfigEditor.inputConfiguration.requirements.placeholderImage')
              }
              helperText={
                showOnlyRequirements
                  ? t('components.controlsConfigEditor.inputConfiguration.requirements.helperTextText')
                  : t('components.controlsConfigEditor.inputConfiguration.requirements.helperTextImage')
              }
            />

            {!showOnlyRequirements && (
              /* Image Descriptions Configuration - Multi-language */
              <MultiLanguageImageDescriptionsEditor
                values={config.inputConfig.imageDescriptions || createEmptyImageDescriptionsObject()}
                onChange={(values) => {
                  // Check if any language has descriptions (even empty ones), if not set to undefined
                  const hasDescriptions = Object.values(values).some((descriptions) => descriptions.length > 0);
                  updateInputConfig({ imageDescriptions: hasDescriptions ? values : undefined });
                }}
                maxImages={config.inputConfig.imageSize}
                disabled={disabled}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Controls Configuration */}
      {!showOnlyRequirements && (
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">{t('components.controlsConfigEditor.controlComponents.title')}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={newControlType}
                    onChange={(e) => setNewControlType(e.target.value)}
                    disabled={disabled}>
                    {getControlTypes(t).map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addControl} disabled={disabled}>
                  {t('components.controlsConfigEditor.controlComponents.addControl')}
                </Button>
              </Stack>
            </Stack>

            {config.controlsConfig.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                {t('components.controlsConfigEditor.controlComponents.noControls')}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {config.controlsConfig.map((controlConfig, index) => (
                  <ControlConfigEditor
                    key={`control-${index}-${controlConfig.type || 'unknown'}`}
                    controlConfig={controlConfig}
                    onChange={(newConfig) => updateControl(index, newConfig)}
                    onDelete={() => removeControl(index)}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
