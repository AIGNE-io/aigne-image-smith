import type { ProjectControlsConfig } from '../components/project-controls/types';

// 基础单图项目配置（类似原来的 pix-loom 功能）
export const basicImageEnhanceConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 1,
    requirements: 'Upload a photo for AI enhancement and restoration',
  },
  controlsConfig: [],
};

export const basicImageEnhancePrompt =
  'Enhance and restore this image: {{image1}}. Improve quality, remove noise, and make it look professional while preserving original details.';

// ID 照片制作配置（类似 id-photo-maker 功能）
export const idPhotoMakerConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 1,
    requirements: 'Upload a clear portrait photo. The face should be well-lit and visible.',
  },
  controlsConfig: [
    {
      type: 'backgroundSelector',
      key: 'background',
      label: 'Background Color',
      description: 'Choose the background color for your ID photo',
      required: true,
      defaultValue: 'blue',
      backgrounds: [
        { value: 'white', label: 'White', color: '#FFFFFF' },
        { value: 'blue', label: 'Blue', color: '#1565C0' },
        { value: 'red', label: 'Red', color: '#C62828' },
        { value: 'gray', label: 'Gray', color: '#424242' },
      ],
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
        { value: 'visa', label: 'Visa (50×50mm)' },
      ],
    },
  ],
};

export const idPhotoMakerPrompt = `Extract the head portrait and create a professional ID photo with the following requirements:
1. Crop to head and shoulder portrait ({{size}} ID photo style)
2. {{background === 'white' ? 'Pure white' : background === 'blue' ? 'Deep blue' : background === 'red' ? 'Deep red' : background === 'gray' ? 'Deep gray' : 'Deep blue'}} background
3. Professional business attire appearance
4. Front-facing pose with proper head position
5. Natural, slight smile expression
6. Clean background removal with proper studio lighting
7. Standard ID photo dimensions and format
8. High-quality professional appearance suitable for official documents and IDs

Source image: {{image1}}`;

// 多图拼贴配置
export const collageConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 4,
    imageDescriptions: [
      'Main image (center focus)',
      'Secondary image',
      'Optional third image',
      'Optional fourth image',
    ],
    requirements: 'Upload up to 4 images to create a beautiful collage. Images will be arranged artistically.',
  },
  controlsConfig: [
    {
      type: 'select',
      key: 'layout',
      label: 'Layout Style',
      description: 'Choose how to arrange your images',
      required: true,
      defaultValue: 'grid',
      options: [
        { value: 'grid', label: '🔲 Grid Layout' },
        { value: 'mosaic', label: '🎨 Artistic Mosaic' },
        { value: 'magazine', label: '📰 Magazine Style' },
        { value: 'polaroid', label: '📷 Polaroid Stack' },
      ],
    },
    {
      type: 'slider',
      key: 'spacing',
      label: 'Image Spacing',
      description: 'Space between images (pixels)',
      defaultValue: 10,
      min: 0,
      max: 50,
      step: 5,
    },
    {
      type: 'select',
      key: 'aspect_ratio',
      label: 'Output Aspect Ratio',
      description: 'Final collage dimensions',
      defaultValue: 'square',
      options: [
        { value: 'square', label: '1:1 Square' },
        { value: 'landscape', label: '16:9 Landscape' },
        { value: 'portrait', label: '9:16 Portrait' },
        { value: 'wide', label: '21:9 Ultrawide' },
      ],
    },
  ],
};

export const collagePrompt = `Create a {{layout}} style photo collage with {{aspect_ratio}} aspect ratio using these images:
{{#image1}}Main image: {{image1}}{{/image1}}
{{#image2}}Secondary image: {{image2}}{{/image2}}
{{#image3}}Third image: {{image3}}{{/image3}}
{{#image4}}Fourth image: {{image4}}{{/image4}}

Layout specifications:
- Style: {{layout}} arrangement
- Spacing: {{spacing}}px between images
- Aspect ratio: {{aspect_ratio}}
- Professional, balanced composition
- High-quality output suitable for printing or sharing

Make sure all images are well-integrated and the composition is visually pleasing.`;

// 艺术风格转换配置
export const artStyleConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 2,
    imageDescriptions: ['Source image to transform', 'Style reference (optional)'],
    requirements: 'Upload your photo and optionally a style reference image for artistic transformation.',
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
        { value: 'pop_art', label: '🎯 Pop Art' },
        { value: 'impressionist', label: '🌅 Impressionist' },
        { value: 'digital_art', label: '💻 Digital Art' },
      ],
    },
    {
      type: 'slider',
      key: 'intensity',
      label: 'Style Intensity',
      description: 'How strong should the artistic effect be?',
      defaultValue: 80,
      min: 30,
      max: 100,
      step: 10,
    },
    {
      type: 'select',
      key: 'color_palette',
      label: 'Color Palette',
      description: 'Choose color scheme',
      defaultValue: 'original',
      options: [
        { value: 'original', label: 'Keep Original', color: '#888888' },
        { value: 'warm', label: 'Warm Tones', color: '#FF6B35' },
        { value: 'cool', label: 'Cool Tones', color: '#4ECDC4' },
        { value: 'monochrome', label: 'Black & White', color: '#666666' },
        { value: 'vintage', label: 'Vintage', color: '#D2691E' },
        { value: 'vibrant', label: 'Vibrant', color: '#FF1493' },
      ],
    },
    {
      type: 'text',
      key: 'custom_style',
      label: 'Custom Style Description',
      description: 'Describe any specific style elements you want',
      placeholder: 'e.g., Van Gogh swirls, heavy brushstrokes...',
      maxLength: 200,
    },
  ],
};

export const artStylePrompt = `Transform this image into {{art_style}} artwork: {{image1}}
{{#image2}}Using this as style reference: {{image2}}{{/image2}}

Style parameters:
- Art style: {{art_style}}
- Intensity: {{intensity}}%
- Color palette: {{color_palette}}
{{#custom_style}}
- Custom elements: {{custom_style}}
{{/custom_style}}

Create a beautiful artistic rendering that:
- Maintains recognizable elements from the original image
- Applies authentic {{art_style}} techniques and characteristics
- Uses {{color_palette}} color scheme appropriately
- Balances artistic transformation with visual clarity
- Produces museum-quality artistic output`;

// 老照片修复配置
export const photoRestorationConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 2,
    imageDescriptions: ['Old photo to restore', 'Reference photo for color matching (optional)'],
    requirements: 'Upload old, damaged, or faded photos for professional AI restoration.',
  },
  controlsConfig: [
    {
      type: 'select',
      key: 'damage_type',
      label: 'Damage Type',
      description: 'What kind of damage needs repair?',
      required: true,
      defaultValue: 'general',
      multiple: true,
      options: [
        { value: 'general', label: 'General Enhancement' },
        { value: 'scratches', label: 'Scratches & Lines' },
        { value: 'stains', label: 'Stains & Spots' },
        { value: 'fading', label: 'Color Fading' },
        { value: 'tears', label: 'Tears & Holes' },
        { value: 'wrinkles', label: 'Wrinkles & Creases' },
      ],
    },
    {
      type: 'slider',
      key: 'enhancement_level',
      label: 'Enhancement Level',
      description: 'How much enhancement to apply',
      defaultValue: 70,
      min: 30,
      max: 100,
      step: 10,
    },
    {
      type: 'select',
      key: 'colorization',
      label: 'Colorization',
      description: 'Add color to black & white photos?',
      defaultValue: 'auto',
      options: [
        { value: 'none', label: 'Keep Original' },
        { value: 'auto', label: 'Auto Colorize' },
        { value: 'natural', label: 'Natural Colors' },
        { value: 'period_accurate', label: 'Period Accurate' },
      ],
    },
    {
      type: 'text',
      key: 'context',
      label: 'Photo Context',
      description: 'Tell us about this photo (helps with restoration)',
      placeholder: 'e.g., Family portrait from 1950s, taken in New York...',
      maxLength: 300,
    },
  ],
};

export const photoRestorationPrompt = `Professionally restore this vintage photograph: {{image1}}
{{#image2}}Use this reference for color/style guidance: {{image2}}{{/image2}}

Restoration requirements:
- Damage types to address: {{damage_type}}
- Enhancement level: {{enhancement_level}}%
- Colorization: {{colorization}}
{{#context}}
- Historical context: {{context}}
{{/context}}

Apply professional restoration techniques to:
1. Remove physical damage (scratches, stains, tears)
2. Enhance image quality and sharpness
3. Improve contrast and lighting
4. {{#colorization !== 'none'}}Add appropriate colorization{{/colorization}}
5. Preserve historical authenticity
6. Maintain original character while making improvements

Produce a museum-quality restored photograph that honors the original while making it suitable for modern viewing and printing.`;

// 产品照片优化配置
export const productPhotoConfig: ProjectControlsConfig = {
  inputConfig: {
    imageSize: 1,
    requirements: 'Upload product photos for professional e-commerce optimization.',
  },
  controlsConfig: [
    {
      type: 'backgroundSelector',
      key: 'background',
      label: 'Background Style',
      description: 'Choose background for your product',
      required: true,
      defaultValue: 'white',
      backgrounds: [
        { value: 'white', label: 'Pure White', color: '#FFFFFF' },
        { value: 'gradient', label: 'Gradient', color: '#F5F5F5' },
        { value: 'lifestyle', label: 'Lifestyle Scene', color: '#E8E8E8' },
        { value: 'transparent', label: 'Transparent', color: '#CCCCCC' },
      ],
    },
    {
      type: 'select',
      key: 'lighting',
      label: 'Lighting Style',
      description: 'Professional lighting setup',
      defaultValue: 'studio',
      options: [
        { value: 'studio', label: '💡 Studio Lighting' },
        { value: 'natural', label: '☀️ Natural Light' },
        { value: 'dramatic', label: '🎭 Dramatic' },
        { value: 'soft', label: '🕯️ Soft & Warm' },
      ],
    },
    {
      type: 'select',
      key: 'angle',
      label: 'Product Angle',
      description: 'Optimize viewing angle',
      defaultValue: 'keep',
      options: [
        { value: 'keep', label: 'Keep Original' },
        { value: 'front', label: 'Front View' },
        { value: 'three_quarter', label: '3/4 View' },
        { value: 'hero', label: 'Hero Angle' },
      ],
    },
    {
      type: 'number',
      key: 'resolution',
      label: 'Output Resolution',
      description: 'Image resolution for e-commerce',
      defaultValue: 2000,
      min: 800,
      max: 4000,
      step: 200,
      unit: 'px',
    },
  ],
};

export const productPhotoPrompt = `Create a professional e-commerce product photo from: {{image1}}

Product photo specifications:
- Background: {{background}}
- Lighting: {{lighting}} style
- Viewing angle: {{angle}}
- Resolution: {{resolution}}px

Professional requirements:
1. Clean, distraction-free {{background}} background
2. Perfect {{lighting}} that highlights product features
3. {{angle !== 'keep' ? 'Optimize to ' + angle + ' for best presentation' : 'Maintain current angle with improvements'}}
4. Sharp focus on product details
5. Color accuracy for e-commerce standards
6. Professional composition and cropping
7. High-resolution output suitable for online stores
8. Remove any imperfections or distracting elements

Create a professional product image that would increase conversion rates and showcase the product in its best light.`;

// 导出所有配置
export const projectConfigs = {
  'basic-enhance': {
    config: basicImageEnhanceConfig,
    prompt: basicImageEnhancePrompt,
    name: 'Basic Image Enhancement',
    description: 'Enhance and restore any photo with AI',
  },
  'id-photo': {
    config: idPhotoMakerConfig,
    prompt: idPhotoMakerPrompt,
    name: 'ID Photo Maker',
    description: 'Create professional ID photos with custom backgrounds',
  },
  'photo-collage': {
    config: collageConfig,
    prompt: collagePrompt,
    name: 'Photo Collage Creator',
    description: 'Combine multiple photos into artistic collages',
  },
  'art-style': {
    config: artStyleConfig,
    prompt: artStylePrompt,
    name: 'Art Style Transfer',
    description: 'Transform photos into various artistic styles',
  },
  'photo-restoration': {
    config: photoRestorationConfig,
    prompt: photoRestorationPrompt,
    name: 'Vintage Photo Restoration',
    description: 'Restore old and damaged photographs professionally',
  },
  'product-photo': {
    config: productPhotoConfig,
    prompt: productPhotoPrompt,
    name: 'Product Photo Optimizer',
    description: 'Create professional e-commerce product photos',
  },
};

export type ProjectConfigKey = keyof typeof projectConfigs;
