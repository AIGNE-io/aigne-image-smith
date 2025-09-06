# Pix-Loom Payment API Documentation

This document describes the credit-based payment system API endpoints for the Pix-Loom image processing application.

## Overview

The Pix-Loom payment system uses a credit-based model where:
- Users receive **5 free credits** upon first login (welcome bonus)
- Each image processing operation consumes **1 credit**
- Users can purchase additional credits through integrated payment flow
- All transactions are tracked and auditable

## Authentication

All endpoints require DID-based authentication using Blocklet SDK:
```javascript
// Headers required
Authorization: Bearer <user-session-token>
```

## API Endpoints

### 1. Get Credit Balance

**GET** `/api/payment/credits/balance`

Get the current user's credit balance and account status.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 5,
    "isNewUser": false,
    "isAuthenticated": true
  }
}
```

**Response Fields:**
- `balance`: Current credit balance (number)
- `isNewUser`: Whether user is eligible for welcome credits (boolean)
- `isAuthenticated`: Authentication status (boolean)

---

### 2. Claim Welcome Credits

**POST** `/api/payment/credits/claim-welcome`

Claim free welcome credits for new users (one-time only).

**Response:**
```json
{
  "success": true,
  "data": {
    "creditGrant": {
      "id": "grant_xyz123",
      "amount": "5",
      "currency_id": "currency_credits",
      "category": "promotional",
      "name": "Welcome Bonus"
    },
    "newBalance": 5,
    "message": "Welcome credits granted successfully"
  }
}
```

**Error Response:**
```json
{
  "error": "Welcome credits already claimed",
  "message": "User has already received welcome credits"
}
```

---

### 3. Consume Credits

**POST** `/api/payment/credits/consume`

Consume credits for image processing operations.

**Request Body:**
```json
{
  "amount": 1,
  "operation_type": "image_colorization",
  "image_type": "black_white_photo",
  "metadata": {
    "filename": "vintage_photo.jpg",
    "file_size": "2.5MB",
    "dimensions": "1024x768"
  }
}
```

**Request Fields:**
- `amount` (required): Number of credits to consume (positive integer)
- `operation_type` (optional): Type of operation performed
- `image_type` (optional): Type of image being processed  
- `metadata` (optional): Additional operation metadata

**Response:**
```json
{
  "success": true,
  "data": {
    "meterEvent": {
      "id": "meter_event_abc456",
      "event_name": "image_processing",
      "timestamp": 1640995200
    },
    "consumed": 1,
    "newBalance": 4,
    "message": "Successfully consumed 1 credits"
  }
}
```

**Error Response (Insufficient Credits):**
```json
{
  "error": "Insufficient credits",
  "message": "Required: 1, Available: 0",
  "currentBalance": 0
}
```

---

### 4. Get Transaction History

**GET** `/api/payment/credits/history?limit=50`

Get user's credit transaction history.

**Query Parameters:**
- `limit` (optional): Maximum number of transactions to return (1-100, default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "grant_xyz123",
        "type": "credit",
        "amount": 5,
        "timestamp": 1640995200000,
        "description": "Welcome Bonus",
        "metadata": {
          "type": "welcome_bonus",
          "granted_at": "2022-01-01T00:00:00.000Z"
        }
      },
      {
        "id": "meter_event_abc456", 
        "type": "debit",
        "amount": -1,
        "timestamp": 1640995800000,
        "description": "Image processing",
        "metadata": {
          "operation_type": "image_colorization"
        }
      }
    ],
    "total": 2
  }
}
```

**Transaction Types:**
- `credit`: Positive balance change (grants, purchases)
- `debit`: Negative balance change (consumption)

---

### 5. Create Payment Checkout

**POST** `/api/payment/credits/checkout`

Create a payment checkout session for purchasing credits.

**Request Body:**
```json
{
  "credits": 50
}
```

**Request Fields:**
- `credits` (required): Number of credits to purchase (1-1000)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "checkout_session_def789",
    "sessionUrl": "https://payment.blocklet.com/checkout/def789",
    "credits": 50,
    "amount": 500
  }
}
```

**Response Fields:**
- `sessionId`: Checkout session identifier
- `sessionUrl`: URL to redirect user for payment
- `credits`: Number of credits being purchased
- `amount`: Total price in cents (USD)

---

### 6. Get Pricing Information

**GET** `/api/payment/credits/pricing`

Get available credit packages and pricing information.

**Response:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "basic",
        "name": "Basic Package", 
        "credits": 10,
        "price": 100,
        "pricePerCredit": 10,
        "popular": false
      },
      {
        "id": "standard",
        "name": "Standard Package",
        "credits": 50, 
        "price": 450,
        "pricePerCredit": 9,
        "popular": true
      },
      {
        "id": "premium",
        "name": "Premium Package",
        "credits": 100,
        "price": 800, 
        "pricePerCredit": 8,
        "popular": false
      }
    ],
    "currency": "USD",
    "welcomeCredits": 5
  }
}
```

---

### 7. Payment Webhooks

**POST** `/api/payment/webhook`

Handle payment system webhooks (internal endpoint).

This endpoint processes payment completion events and automatically grants purchased credits to users.

**Supported Webhook Events:**
- `payment_intent.succeeded`: Successful payment completion
- `checkout.session.completed`: Checkout session completion

---

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description",
  "details": "Additional error context (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid input, insufficient credits)
- `401`: Unauthorized (missing/invalid authentication)
- `500`: Internal Server Error

---

## Integration Example

Here's a typical integration flow for image processing:

```javascript
// 1. Check user balance before processing
const balanceResponse = await fetch('/api/payment/credits/balance', {
  headers: { 'Authorization': `Bearer ${userToken}` }
});
const { balance, isNewUser } = balanceResponse.data;

// 2. Handle new user welcome flow
if (isNewUser) {
  const welcomeResponse = await fetch('/api/payment/credits/claim-welcome', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  console.log('Welcome credits granted:', welcomeResponse.data.newBalance);
}

// 3. Check if user has enough credits
if (balance >= 1) {
  // 4. Consume credit for image processing
  const consumeResponse = await fetch('/api/payment/credits/consume', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 1,
      operation_type: 'image_colorization',
      metadata: { filename: 'user_photo.jpg' }
    })
  });
  
  // 5. Proceed with image processing
  if (consumeResponse.success) {
    await processImage();
    console.log('Processing complete, remaining credits:', consumeResponse.data.newBalance);
  }
} else {
  // 6. Redirect to purchase more credits
  const checkoutResponse = await fetch('/api/payment/credits/checkout', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ credits: 10 })
  });
  
  window.open(checkoutResponse.data.sessionUrl, '_blank');
}
```

---

## Environment Configuration

Required environment variables:

```bash
# Blocklet Payment System Configuration
BLOCKLET_PAYMENT_ENDPOINT=https://payment.blocklet.com/api/v1
BLOCKLET_PAYMENT_TOKEN=your_payment_access_token

# Optional: Custom pricing configuration
WELCOME_CREDITS_AMOUNT=5
CREDITS_PER_OPERATION=1
```

---

## Rate Limiting

API endpoints have the following rate limits:

- **Balance/History endpoints**: 100 requests per minute
- **Consume credits**: 10 requests per minute  
- **Claim welcome**: 1 request per user (one-time only)
- **Checkout creation**: 5 requests per minute

---

## Testing

Use the provided test file for manual testing:
```bash
node api/src/routes/__tests__/payment.test.js
```

Or test endpoints directly with curl:
```bash
# Get balance
curl -H "Authorization: Bearer ${TOKEN}" \
     http://localhost:3000/api/payment/credits/balance

# Consume credits  
curl -X POST \
     -H "Authorization: Bearer ${TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"amount": 1}' \
     http://localhost:3000/api/payment/credits/consume
```