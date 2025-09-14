# Pix-Loom: 通用 AI 图片应用模板

Pix-Loom 现已升级为一个强大的通用 AI 图片应用模板，支持多种图片处理场景，包括多图上传、动态控制组件和可配置的 prompt 系统。

## 🚀 新功能特性

### 1. 多图片支持
- 支持 1-10 张图片上传
- 可配置最少/最多图片数量
- 图片描述和要求说明
- 拖拽预览和删除功能

### 2. 动态控制组件
- **背景选择器**: 颜色选择 (如 ID 照片背景)
- **下拉选择**: 单选/多选选项
- **滑块控制**: 数值调整 (强度、间距等)
- **数字输入**: 精确数值设置
- **文本输入**: 自定义描述和要求

### 3. 智能 Prompt 系统
- 变量替换: `{{variable}}` 语法
- 条件内容: `{{#condition}}...{{/condition}}`
- 图片占位符: `{{image1}}`, `{{image2}}` 等
- 控制组件值自动注入

### 4. 可视化配置界面
- 管理员创建/编辑项目
- 拖拽式组件配置
- 实时预览效果
- 表单验证和帮助提示

## 📁 项目结构

```
src/
├── components/
│   ├── project-controls/          # 控制组件系统
│   │   ├── types.ts              # 类型定义
│   │   ├── ControlRenderer.tsx   # 组件渲染器
│   │   └── ControlsConfigEditor.tsx  # 配置编辑器
│   ├── MultiImageUploader.tsx    # 多图上传组件
│   └── BackgroundSelector.tsx    # 背景选择组件
├── pages/
│   ├── ai-project-home.tsx       # 通用项目首页
│   └── admin/projects/           # 项目管理
│       ├── create.tsx            # 创建项目
│       └── edit.tsx             # 编辑项目
├── libs/
│   └── promptUtils.ts           # Prompt 处理工具
├── examples/
│   └── project-configs.ts       # 配置示例
└── docs/
    ├── README.md                # 使用指南
    └── project-configuration-examples.md  # 配置示例
```

## 🛠️ 使用方法

### 1. 创建新的 AI 项目

在管理界面中，可以配置：

```typescript
interface AIProjectConfig {
  // 基础信息
  clientId: string;
  title: string;
  subtitle: string;
  description: string;

  // AI Prompt 模板
  prompt: string;

  // 输入配置
  controlsConfig: {
    inputConfig: {
      maxImages: number;        // 最大图片数
      minImages?: number;       // 最小图片数
      imageDescriptions?: string[];  // 图片描述
      requirements?: string;    // 上传要求
    },
    controlsConfig: ControlConfig[];  // 控制组件
  };

  // UI 配置
  uiConfig: {
    features: {
      showComparisonSlider: boolean;  // 对比滑块
    };
  };
}
```

### 2. 配置控制组件

#### 背景选择器
```typescript
{
  type: 'backgroundSelector',
  key: 'background',
  label: 'Background Color',
  defaultValue: 'blue',
  backgrounds: [
    { value: 'white', label: 'White', color: '#FFFFFF' },
    { value: 'blue', label: 'Blue', color: '#1565C0' }
  ]
}
```

#### 下拉选择
```typescript
{
  type: 'select',
  key: 'style',
  label: 'Art Style',
  options: [
    { value: 'oil', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' }
  ]
}
```

#### 滑块控制
```typescript
{
  type: 'slider',
  key: 'intensity',
  label: 'Effect Intensity',
  min: 0,
  max: 100,
  step: 10,
  defaultValue: 70
}
```

### 3. 编写 Prompt 模板

```typescript
const promptTemplate = `Transform this image: {{image1}}
{{#image2}}Using style reference: {{image2}}{{/image2}}

Style: {{art_style}}
Background: {{background}}
Intensity: {{intensity}}%

Create a professional result with these requirements...`;
```

### 4. 在 React 中使用

```typescript
import { AIProjectHome } from './pages/ai-project-home';

function MyApp() {
  const config = {
    clientId: 'my-project',
    title: 'AI Art Studio',
    subtitle: 'Transform your photos',
    description: 'Upload and customize your images',
    prompt: promptTemplate,
    controlsConfig: myControlsConfig,
    uiConfig: {
      features: {
        showComparisonSlider: true
      }
    }
  };

  return <AIProjectHome config={config} />;
}
```

## 📖 预设配置示例

项目包含多个预设配置，开箱即用：

- **基础图片增强**: 单图上传，AI 自动优化
- **ID 照片制作**: 人像 + 背景选择
- **照片拼贴**: 多图组合，布局选择
- **艺术风格转换**: 图片 + 风格控制
- **老照片修复**: 专业修复设置
- **产品照片优化**: 电商图片处理

## 🎯 应用场景

### 1. ID 照片制作
- 单张人像上传
- 背景颜色选择 (白/蓝/红/灰)
- 尺寸规格选择 (1寸/2寸/护照/签证)

### 2. 艺术创作工具
- 单图或双图 (原图+风格参考)
- 艺术风格选择 (油画/水彩/素描等)
- 强度和色彩控制

### 3. 电商产品图
- 产品照片上传
- 背景替换 (纯白/渐变/生活场景)
- 灯光和角度优化

### 4. 照片修复服务
- 老照片上传 + 参考图
- 损坏类型选择
- 修复程度控制
- 历史背景描述

### 5. 社交媒体工具
- 多图拼贴
- 布局和间距调整
- 滤镜和风格化

## 🔧 技术架构

### 前端组件化设计
- **ControlRenderer**: 通用控制组件渲染器
- **MultiImageUploader**: 多图上传组件
- **ProjectControls**: 动态控制面板
- **AIProjectHome**: 通用项目模板

### Prompt 处理引擎
- 变量替换和条件渲染
- 图片占位符自动填充
- 控制组件值注入
- 模板验证和错误处理

### 配置系统
- 类型安全的配置接口
- 可视化配置编辑器
- 实时预览和验证
- 导入导出配置

## 🚀 部署和扩展

### 1. 添加新的控制组件类型

在 `types.ts` 中定义新类型：
```typescript
export interface CustomControlConfig extends BaseControlConfig {
  type: 'custom';
  customOptions: any[];
}
```

在 `ControlRenderer.tsx` 中添加渲染逻辑：
```typescript
case 'custom':
  return <CustomControlComponent {...config} />;
```

### 2. 创建新的项目模板

1. 在 `examples/project-configs.ts` 添加配置
2. 设计 prompt 模板
3. 测试各种输入组合
4. 添加到管理界面

### 3. 集成新的 AI 服务

修改 `ai-project-home.tsx` 中的 API 调用：
```typescript
const { data } = await api.post('/api/ai/generate', {
  prompt: finalPrompt,
  images: images,
  provider: 'custom-ai-service',
  modelConfig: customConfig
});
```

## 📝 最佳实践

1. **Prompt 设计**
   - 保持简洁明确
   - 使用描述性变量名
   - 提供条件分支
   - 测试边界情况

2. **控制组件**
   - 选择合适的组件类型
   - 设置合理的默认值
   - 提供清晰的标签和描述
   - 考虑移动端体验

3. **图片处理**
   - 明确图片要求和限制
   - 提供样例和指导
   - 支持多种格式和尺寸
   - 优化上传体验

4. **用户体验**
   - 实时预览效果
   - 清晰的进度指示
   - 友好的错误提示
   - 快速的响应速度

## 🤝 贡献指南

欢迎贡献新的控制组件、项目模板和功能改进：

1. Fork 项目
2. 创建功能分支
3. 添加测试和文档
4. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。