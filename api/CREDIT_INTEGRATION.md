# 积分系统集成文档

## 架构概述

pix-loom 的积分系统完全基于 credit-service-demo 的模式实现，确保了与 Blocklet Payment 系统的无缝集成。

## 核心接口

### Payment Routes (`/api/payment/`)

1. **领取欢迎积分**: `POST /api/payment/credits/grants`
   - 为新用户自动发放 5 个积分
   - 使用 promotional 类型的 creditGrant

2. **查询积分余额**: `GET /api/payment/credits/balance`
   - 实时查询用户可用积分
   - 考虑待结算的消耗量

3. **创建结账会话**: `POST /api/payment/credits/checkout`
   - 创建积分购买的支付会话

4. **支付 Webhook**: `POST /api/payment/webhook`
   - 处理支付系统的回调事件

### AI Routes (`/api/ai/`)

**图像生成**: `POST /api/ai/generate`
- 直接集成积分消耗上报逻辑
- 每次生成图片时自动扣费，无需单独的消耗接口
- 使用 `payment.meterEvents.create()` 创建消耗记录

## 积分消耗流程

```
1. 用户发起 AI 生成请求 (POST /api/ai/generate)
2. 验证用户积分余额
3. 创建数据库记录（pending 状态）
4. 直接调用 payment.meterEvents.create() 上报消耗
5. 执行 AI 处理
6. 更新记录为完成状态
7. 返回结果（包含新的积分余额）
```

## 环境配置

在 `.env` 文件中配置：

```
# 支付测试模式
PAYMENT_TEST_MODE=true

# AIGNE API Key
AIGNE_API_KEY=your_api_key_here
```

## 启动初始化

`pre-start.ts` 会自动初始化：
- 支付测试模式设置
- Webhook 端点配置
- 计量器创建
- 积分价格配置

## 与 credit-service-demo 的一致性

✅ 使用相同的 payment.js 直接导入模式  
✅ 使用相同的 BN (BigNumber) 计算逻辑  
✅ 使用相同的 meterEvents 上报模式  
✅ 使用相同的 creditGrants 管理模式  
✅ 使用相同的 webhook 处理模式  

## API 调用示例

### 领取欢迎积分
```bash
curl -X POST http://localhost:3030/api/payment/credits/grants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN"
```

### 查询余额
```bash
curl http://localhost:3030/api/payment/credits/balance \
  -H "Authorization: Bearer TOKEN"
```

### 生成图片（自动扣费）
```bash
curl -X POST http://localhost:3030/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "prompt": "一匹白马在草原上奔跑",
    "operationType": "generation"
  }'
```

**注意**: 调用此接口会自动扣除 1 个积分，无需单独调用消耗接口。