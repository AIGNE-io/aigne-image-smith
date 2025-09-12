import { Language as LanguageIcon } from '@mui/icons-material';
import { FormControl, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';

interface LanguageSelectorProps {
  locale: string;
  onLocaleChange: (locale: string) => void;
  availableLocales?: string[];
  size?: 'small' | 'medium';
}

const localeLabels: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
};

export default function LanguageSelector({
  locale,
  onLocaleChange,
  availableLocales = ['zh', 'en'],
  size = 'small',
}: LanguageSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onLocaleChange(event.target.value);
  };

  if (availableLocales.length <= 1) {
    return null; // Don't show selector if only one language available
  }

  return (
    <Tooltip title="选择语言">
      <FormControl size={size} variant="outlined">
        <Select
          value={locale}
          onChange={handleChange}
          startAdornment={<LanguageIcon sx={{ mr: 1, fontSize: '1rem' }} />}
          sx={{
            minWidth: 100,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
          }}>
          {availableLocales.map((localeCode) => (
            <MenuItem key={localeCode} value={localeCode}>
              {localeLabels[localeCode] || localeCode.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
