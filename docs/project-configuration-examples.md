# Project Configuration Examples

This document provides examples of how to configure AI projects using the new dynamic configuration system.

## Basic Single Image Project

```typescript
const basicConfig: ProjectControlsConfig = {
  inputConfig: {
    maxImages: 1,
    minImages: 1,
    requirements: "Upload a clear photo for AI enhancement"
  },
  controlsConfig: []
};

const promptTemplate = "Enhance this image: {{image1}}. Make it more professional and clear.";
```

## Multi-Image Collage Project

```typescript
const collageConfig: ProjectControlsConfig = {
  inputConfig: {
    maxImages: 4,
    minImages: 2,
    imageDescriptions: [
      "Main subject photo",
      "Background image",
      "Optional overlay 1",
      "Optional overlay 2"
    ],
    requirements: "Upload 2-4 images to create a professional collage"
  },
  controlsConfig: [
    {
      type: 'select',
      key: 'layout',
      label: 'Collage Layout',
      description: 'Choose how to arrange your images',
      required: true,
      defaultValue: 'grid',
      options: [
        { value: 'grid', label: 'Grid Layout' },
        { value: 'mosaic', label: 'Artistic Mosaic' },
        { value: 'magazine', label: 'Magazine Style' }
      ]
    },
    {
      type: 'slider',
      key: 'spacing',
      label: 'Image Spacing',
      description: 'Adjust space between images',
      defaultValue: 10,
      min: 0,
      max: 50,
      step: 5
    }
  ]
};

const promptTemplate = `Create a {{layout}} style collage using these images:
Main image: {{image1}}
Background: {{image2}}
${/* Include other images if provided */}
{{#image3}}Additional image: {{image3}}{{/image3}}
{{#image4}}Additional image: {{image4}}{{/image4}}

Apply {{spacing}}px spacing between elements. Make it look professional and artistic.`;
```

## ID Photo Maker with Background Selection

```typescript
const idPhotoConfig: ProjectControlsConfig = {
  inputConfig: {
    maxImages: 1,
    minImages: 1,
    requirements: "Upload a clear portrait photo. Face should be visible and well-lit."
  },
  controlsConfig: [
    {
      type: 'backgroundSelector',
      key: 'background',
      label: 'Background Color',
      description: 'Choose background color for your ID photo',
      required: true,
      defaultValue: 'blue',
      backgrounds: [
        { value: 'white', label: 'White', color: '#FFFFFF' },
        { value: 'blue', label: 'Blue', color: '#1565C0' },
        { value: 'red', label: 'Red', color: '#C62828' },
        { value: 'gray', label: 'Gray', color: '#424242' }
      ]
    },
    {
      type: 'select',
      key: 'size',
      label: 'Photo Size',
      description: 'Standard ID photo dimensions',
      required: true,
      defaultValue: '2inch',
      options: [
        { value: '1inch', label: '1 inch (25×35mm)' },
        { value: '2inch', label: '2 inch (35×45mm)' },
        { value: 'passport', label: 'Passport (35×45mm)' },
        { value: 'visa', label: 'Visa (50×50mm)' }
      ]
    }
  ]
};

const promptTemplate = `Create a professional {{size}} ID photo from this portrait: {{image1}}
- Use {{background}} background color
- Standard ID photo composition with head and shoulders
- Professional lighting and clean appearance
- Remove any background elements
- Ensure face is clearly visible and properly centered`;
```

## Advanced Photo Restoration with Multiple Controls

```typescript
const restorationConfig: ProjectControlsConfig = {
  inputConfig: {
    maxImages: 2,
    minImages: 1,
    imageDescriptions: [
      "Main photo to restore",
      "Reference photo (optional) - for color/style matching"
    ],
    requirements: "Upload old or damaged photos for AI restoration"
  },
  controlsConfig: [
    {
      type: 'select',
      key: 'restoration_type',
      label: 'Restoration Type',
      description: 'What type of restoration do you need?',
      required: true,
      defaultValue: 'general',
      options: [
        { value: 'general', label: 'General Enhancement' },
        { value: 'damage', label: 'Damage Repair' },
        { value: 'colorize', label: 'Colorization' },
        { value: 'scratch', label: 'Scratch Removal' }
      ]
    },
    {
      type: 'slider',
      key: 'enhancement_strength',
      label: 'Enhancement Strength',
      description: 'How strong should the enhancement be?',
      defaultValue: 70,
      min: 10,
      max: 100,
      step: 10
    },
    {
      type: 'select',
      key: 'color_style',
      label: 'Color Style',
      description: 'Choose color processing style',
      defaultValue: 'natural',
      multiple: false,
      options: [
        { value: 'natural', label: 'Natural Colors' },
        { value: 'vintage', label: 'Vintage Tones' },
        { value: 'vibrant', label: 'Vibrant Colors' },
        { value: 'sepia', label: 'Sepia Tone' }
      ]
    },
    {
      type: 'text',
      key: 'special_instructions',
      label: 'Special Instructions',
      description: 'Any specific details about the photo or desired outcome?',
      placeholder: 'e.g., This is my grandfather in 1950s...',
      maxLength: 500
    }
  ]
};

const promptTemplate = `Restore this vintage photo: {{image1}}
{{#image2}}Use this reference image for style/color matching: {{image2}}{{/image2}}

Restoration type: {{restoration_type}}
Enhancement strength: {{enhancement_strength}}%
Color style: {{color_style}}
{{#special_instructions}}
Special considerations: {{special_instructions}}
{{/special_instructions}}

Apply professional photo restoration techniques to:
- Remove scratches, spots, and damage
- Enhance clarity and sharpness
- Improve lighting and contrast
- Preserve original character while making improvements`;
```

## Art Style Transfer with Multiple Options

```typescript
const styleTransferConfig: ProjectControlsConfig = {
  inputConfig: {
    maxImages: 2,
    minImages: 1,
    imageDescriptions: [
      "Source image to transform",
      "Style reference image (optional)"
    ],
    requirements: "Upload your photo and optionally a style reference"
  },
  controlsConfig: [
    {
      type: 'select',
      key: 'art_style',
      label: 'Art Style',
      description: 'Choose the artistic style to apply',
      required: true,
      defaultValue: 'oil_painting',
      options: [
        { value: 'oil_painting', label: '🎨 Oil Painting' },
        { value: 'watercolor', label: '💧 Watercolor' },
        { value: 'pencil_sketch', label: '✏️ Pencil Sketch' },
        { value: 'comic_book', label: '📚 Comic Book' },
        { value: 'anime', label: '🎌 Anime Style' },
        { value: 'pop_art', label: '🎯 Pop Art' }
      ]
    },
    {
      type: 'slider',
      key: 'style_intensity',
      label: 'Style Intensity',
      description: 'How strong should the artistic effect be?',
      defaultValue: 80,
      min: 30,
      max: 100,
      step: 10
    },
    {
      type: 'select',
      key: 'color_palette',
      label: 'Color Palette',
      description: 'Choose color scheme for the artwork',
      defaultValue: 'original',
      options: [
        { value: 'original', label: 'Keep Original Colors' },
        { value: 'warm', label: 'Warm Tones', color: '#FF6B35' },
        { value: 'cool', label: 'Cool Tones', color: '#4ECDC4' },
        { value: 'monochrome', label: 'Black & White', color: '#666666' },
        { value: 'vintage', label: 'Vintage Colors', color: '#D2691E' }
      ]
    }
  ]
};

const promptTemplate = `Transform this image into {{art_style}} artwork: {{image1}}
{{#image2}}Use this as style reference: {{image2}}{{/image2}}

Style settings:
- Intensity: {{style_intensity}}%
- Color palette: {{color_palette}}

Create a beautiful artistic rendering that:
- Maintains the composition and key elements of the original
- Applies the chosen artistic style authentically
- Uses appropriate textures and brushwork for the style
- Balances artistic transformation with recognizable details`;
```

## Usage in React Components

```typescript
import { AIProjectHome } from './components/ai-project-home';

function MyArtApp() {
  const config = {
    clientId: 'my-art-project-id',
    title: 'AI Art Studio',
    subtitle: 'Transform your photos into stunning artwork',
    description: 'Upload your photos and choose from various artistic styles',
    prompt: styleTransferPromptTemplate, // From examples above
    controlsConfig: styleTransferConfig,
    uiConfig: {
      features: {
        showComparisonSlider: true
      }
    }
  };

  return <AIProjectHome config={config} />;
}
```

## Prompt Template Syntax

The prompt template system supports these variable types:

- `{{image1}}`, `{{image2}}`, etc. - Automatically filled with uploaded image URLs
- `{{controlKey}}` - Filled with values from control components
- `{{#conditionalVar}}...{{/conditionalVar}}` - Conditional sections (only included if variable has value)

## Best Practices

1. **Keep prompts focused**: Each project should have a clear, specific purpose
2. **Provide clear descriptions**: Help users understand what each control does
3. **Set sensible defaults**: Choose defaults that work well for most use cases
4. **Use appropriate control types**: Match the control type to the kind of input needed
5. **Test with real data**: Try your configuration with actual user inputs
6. **Consider mobile users**: Keep control layouts simple and touch-friendly

## Control Types Reference

- **select**: Dropdown with predefined options (single or multiple selection)
- **slider**: Numeric input with visual slider
- **number**: Direct numeric input with validation
- **text**: Free-form text input with optional length limits
- **backgroundSelector**: Visual color picker with preset options

Each control type has specific configuration options. See the TypeScript interfaces in `src/components/project-controls/types.ts` for complete details.