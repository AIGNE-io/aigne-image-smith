export interface ControlOption {
  value: string;
  label: string | Record<string, string>;
  color?: string;
  description?: string | Record<string, string>;
}

export interface BaseControlConfig {
  type: string;
  key: string;
  label: string | Record<string, string>;
  description?: string | Record<string, string>;
  required?: boolean;
  defaultValue?: any;
}

export interface SelectControlConfig extends BaseControlConfig {
  type: 'select';
  options: ControlOption[];
  multiple?: boolean;
}

export interface SliderControlConfig extends BaseControlConfig {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  marks?: { value: number; label: string }[];
}

export interface NumberInputControlConfig extends BaseControlConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface TextInputControlConfig extends BaseControlConfig {
  type: 'text';
  placeholder?: string | Record<string, string>;
  maxLength?: number;
}

export interface ColorPickerControlConfig extends BaseControlConfig {
  type: 'colorPicker';
  presetColors?: string[];
}

export interface BackgroundSelectorControlConfig extends BaseControlConfig {
  type: 'backgroundSelector';
  backgrounds: Array<{
    value: string;
    label: string | Record<string, string>;
    color: string;
  }>;
}

export type ControlConfig =
  | SelectControlConfig
  | SliderControlConfig
  | NumberInputControlConfig
  | TextInputControlConfig
  | ColorPickerControlConfig
  | BackgroundSelectorControlConfig;

export interface InputConfig {
  inputType?: 'image' | 'text';
  imageSize: number;
  imageDescriptions?: Record<string, string[]>; // 多语言支持的图片描述
  allowedTypes?: string[];
  maxSize?: number;
  requirements?: Record<string, string>; // 多语言支持的要求描述
}

export interface ProjectControlsConfig {
  inputConfig: InputConfig;
  controlsConfig: ControlConfig[];
}

export interface ControlValues {
  [key: string]: any;
}
