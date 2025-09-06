# Pix-Loom AI 图像生成 API 文档

本文档描述了 Pix-Loom 平台的 AI 图像生成 API 接口。

## 概述

AI API 提供以下图像处理功能：
- **上色处理**：将黑白照片转换为彩色照片
- **照片修复**：修复破损或老旧照片
- **图像增强**：提升图像质量和细节
- **风格转换**：为图像应用艺术风格

所有操作都会消耗积分，并在数据库中记录完整历史。

## 身份验证

所有接口都需要基于 DID 的身份验证：
```javascript
// 必需的请求头
Authorization: Bearer <user-session-token>
```

## API 接口

### 1. 生成 AI 处理图像

**POST** `/api/ai/generate`

使用 AI 处理图像，支持指定的操作类型。

**请求体：**
```json
{
  "originalImageUrl": "https://example.com/original.jpg",
  "operationType": "colorization",
  "metadata": {
    "filename": "vintage_photo.jpg",
    "description": "1950年代的家庭照片"
  }
}
```

**请求参数：**
- `originalImageUrl`（可选）：要处理的原始图像URL
- `operationType`（必需）：操作类型，可选值：`colorization`、`restoration`、`enhancement`、`style_transfer`
- `metadata`（可选）：关于操作的附加元数据

**响应：**
```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123",
    "originalImageUrl": "https://example.com/original.jpg",
    "generatedImageUrl": "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    "operationType": "colorization",
    "processingTimeMs": 2340,
    "creditsConsumed": 1,
    "newBalance": 4,
    "status": "completed",
    "message": "上色处理完成"
  }
}
```

**错误响应：**

*积分不足：*
```json
{
  "error": "积分不足",
  "message": "需要：1，可用：0",
  "currentBalance": 0
}
```

*处理失败：*
```json
{
  "error": "AI 生成失败",
  "message": "处理超时或 AI 服务不可用"
}
```

---

### 2. 获取生成状态

**GET** `/api/ai/generation/:id`

获取特定生成任务的当前状态和详细信息。

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "gen_abc123",
    "originalImageUrl": "https://example.com/original.jpg",
    "generatedImageUrl": "https://generated-image-url.com/result.jpg",
    "operationType": "colorization",
    "status": "completed",
    "creditsConsumed": 1,
    "processingTimeMs": 2340,
    "errorMessage": null,
    "metadata": {
      "filename": "vintage_photo.jpg"
    },
    "createdAt": "2025-02-09T18:00:00.000Z",
    "updatedAt": "2025-02-09T18:00:02.340Z"
  }
}
```

**状态值：**
- `pending`：生成请求已接收
- `processing`：AI 处理中
- `completed`：生成完成
- `failed`：生成失败（查看 errorMessage）

---

### 3. 获取生成历史

**GET** `/api/ai/history?limit=20&offset=0&operationType=colorization`

获取用户的 AI 生成历史，支持可选过滤。

**查询参数：**
- `limit`（可选）：返回结果数量（1-100，默认：20）
- `offset`（可选）：跳过的结果数量（默认：0）
- `operationType`（可选）：按操作类型过滤

**响应：**
```json
{
  "success": true,
  "data": {
    "generations": [
      {
        "id": "gen_abc123",
        "originalImageUrl": "https://example.com/original.jpg",
        "generatedImageUrl": "https://generated-url.com/result.jpg",
        "operationType": "colorization",
        "status": "completed",
        "creditsConsumed": 1,
        "processingTimeMs": 2340,
        "createdAt": "2025-02-09T18:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    },
    "statistics": {
      "totalGenerations": 15,
      "completedGenerations": 14,
      "totalCreditsSpent": 15,
      "successRate": 93.33
    }
  }
}
```

---

### 4. 删除生成记录

**DELETE** `/api/ai/generation/:id`

从历史记录中删除生成记录。

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "生成记录删除成功",
    "deletedId": "gen_abc123"
  }
}
```

---

### 5. 获取用户统计

**GET** `/api/ai/stats`

获取关于用户 AI 生成使用情况的综合统计。

**响应：**
```json
{
  "success": true,
  "data": {
    "totalGenerations": 25,
    "completedGenerations": 23,
    "totalCreditsSpent": 25,
    "successRate": 92.0,
    "recentActivity": 8,
    "period": "30 天"
  }
}
```

**统计字段：**
- `totalGenerations`：总生成请求数
- `completedGenerations`：成功生成数
- `totalCreditsSpent`：AI 操作消耗的总积分
- `successRate`：成功率百分比
- `recentActivity`：最近30天的生成数

---

## 操作类型

### 上色处理（Colorization）
- **描述**：将黑白图像转换为全彩色
- **使用场景**：历史照片、复古图像
- **处理时间**：约2-3秒（模拟）
- **积分消耗**：1个积分/次

### 照片修复（Restoration）
- **描述**：修复损坏、去除划痕、增强老照片
- **使用场景**：受损照片、褪色图像、撕裂图片
- **处理时间**：约3-4秒（模拟）
- **积分消耗**：1个积分/次

### 图像增强（Enhancement）
- **描述**：提升图像质量、锐度和细节
- **使用场景**：模糊图像、低分辨率照片
- **处理时间**：约1-2秒（模拟）
- **积分消耗**：1个积分/次

### 风格转换（Style Transfer）
- **描述**：为图像应用艺术风格
- **使用场景**：创意效果、艺术转换
- **处理时间**：约2-3秒（模拟）
- **积分消耗**：1个积分/次

---

## Mock 实现详情

**当前实现状态**：Mock/演示模式

当前 API 使用模拟响应进行开发和测试：

- **模拟处理**：模拟真实的处理延迟
- **模拟结果**：返回从 Unsplash 精选的高质量图像
- **真实积分系统**：积分实际从用户账户中消耗
- **真实数据库**：所有操作都记录在数据库中
- **真实身份验证**：完整的基于 DID 的用户身份验证

### Mock 图像来源

API 当前从这些 Unsplash 集合返回图像：
- **上色处理**：彩色花卉、人物和建筑照片
- **照片修复**：风景和自然照片
- **图像增强**：高质量风景图像
- **风格转换**：艺术和创意照片

---

## 集成示例

```javascript
// 完整的 AI 生成工作流程
async function processImage(originalImageUrl, operationType) {
  try {
    // 1. 开始 AI 生成
    const generateResponse = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalImageUrl,
        operationType,
        metadata: {
          source: 'web_upload',
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await generateResponse.json();
    
    if (result.success) {
      console.log('处理完成：', result.data);
      
      // 2. 可选择检查状态（用于异步处理）
      const statusResponse = await fetch(`/api/ai/generation/${result.data.generationId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      // 3. 显示结果或更新界面
      displayProcessedImage(result.data.generatedImageUrl);
      updateCreditBalance(result.data.newBalance);
      
      return result.data;
    } else {
      handleError(result.error);
    }
  } catch (error) {
    console.error('AI 处理失败：', error);
    throw error;
  }
}

// 使用示例
await processImage('https://example.com/bw_photo.jpg', 'colorization');
await processImage('https://example.com/damaged.jpg', 'restoration');
await processImage('https://example.com/blurry.jpg', 'enhancement');
```

---

## 数据库架构

### image_generations 表

```sql
CREATE TABLE image_generations (
  id VARCHAR PRIMARY KEY,
  userDid VARCHAR NOT NULL,
  originalImageUrl TEXT,
  generatedImageUrl TEXT NOT NULL,
  operationType ENUM('colorization', 'restoration', 'enhancement', 'style_transfer') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  creditsConsumed INTEGER DEFAULT 1,
  processingTimeMs INTEGER,
  errorMessage TEXT,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_image_generations_user_did ON image_generations(userDid);
CREATE INDEX idx_image_generations_status ON image_generations(status);
CREATE INDEX idx_image_generations_operation_type ON image_generations(operationType);
CREATE INDEX idx_image_generations_created_at ON image_generations(createdAt);
```

---

## 错误处理

**常见 HTTP 状态码：**
- `200`：成功
- `400`：错误请求（无效参数、积分不足）
- `401`：未授权（缺少/无效的身份验证）
- `404`：未找到（生成未找到或访问被拒绝）
- `500`：内部服务器错误

**错误响应格式：**
```json
{
  "error": "错误类型",
  "message": "人类可读的错误描述",
  "details": "额外的上下文（可选）"
}
```

---

## 速率限制

每个用户的当前速率限制：
- **生成请求**：10次/分钟
- **状态检查**：100次/分钟
- **历史查询**：50次/分钟
- **统计查询**：20次/分钟

---

## 未来增强

**计划功能：**
1. **真实 AI 集成**：用实际的 AI 服务替换模拟
2. **批量处理**：一次处理多张图像
3. **自定义参数**：用户可配置的处理选项
4. **进度更新**：实时 WebSocket 进度通知
5. **高级操作**：面部增强、背景移除等
6. **质量设置**：不同质量级别，积分消耗不同

**集成就绪：**
- 支付系统完全集成
- 数据库架构支持所有计划功能
- 身份验证和授权完成
- 完整的审计跟踪和历史记录