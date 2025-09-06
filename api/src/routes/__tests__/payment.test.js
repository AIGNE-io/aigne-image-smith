/**
 * Integration tests for payment API endpoints
 * This file can be used to manually test the credit system functionality
 */

// Mock request objects for testing
const createMockReq = (userDid, body = {}, query = {}) => ({
  user: { did: userDid },
  body,
  query,
  ip: '127.0.0.1',
  get: (header) => header === 'User-Agent' ? 'test-agent' : undefined,
  protocol: 'http',
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => ({ ...res, statusCode: code });
  res.json = (data) => ({ ...res, data });
  return res;
};

// Example usage and test scenarios
const testScenarios = {
  // Test user credit balance check
  testGetBalance: {
    endpoint: 'GET /api/payment/credits/balance',
    description: 'Get user credit balance and eligibility status',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7'),
    expectedResponse: {
      success: true,
      data: {
        balance: 0, // or current balance
        isNewUser: true, // or false if already claimed
        isAuthenticated: true,
      },
    },
  },

  // Test welcome credits claiming
  testClaimWelcome: {
    endpoint: 'POST /api/payment/credits/claim-welcome',
    description: 'Claim welcome credits for new users',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7'),
    expectedResponse: {
      success: true,
      data: {
        creditGrant: {
          id: 'grant_id',
          amount: '5',
          // ... other grant details
        },
        newBalance: 5,
        message: 'Welcome credits granted successfully',
      },
    },
  },

  // Test credit consumption
  testConsumeCredits: {
    endpoint: 'POST /api/payment/credits/consume',
    description: 'Consume credits for image processing',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7', {
      amount: 1,
      operation_type: 'image_colorization',
      image_type: 'black_white_photo',
      metadata: {
        filename: 'test_image.jpg',
        size: '2MB',
      },
    }),
    expectedResponse: {
      success: true,
      data: {
        meterEvent: {
          id: 'meter_event_id',
          // ... other event details
        },
        consumed: 1,
        newBalance: 4,
        message: 'Successfully consumed 1 credits',
      },
    },
  },

  // Test credit history
  testGetHistory: {
    endpoint: 'GET /api/payment/credits/history?limit=10',
    description: 'Get user credit transaction history',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7', {}, { limit: 10 }),
    expectedResponse: {
      success: true,
      data: {
        transactions: [
          {
            id: 'transaction_id',
            type: 'credit', // or 'debit'
            amount: 5,
            timestamp: 1640995200000,
            description: 'Welcome Bonus',
            metadata: {},
          },
        ],
        total: 1,
      },
    },
  },

  // Test checkout session creation
  testCreateCheckout: {
    endpoint: 'POST /api/payment/credits/checkout',
    description: 'Create payment checkout session for purchasing credits',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7', {
      credits: 50,
    }),
    expectedResponse: {
      success: true,
      data: {
        sessionId: 'checkout_session_id',
        sessionUrl: 'https://payment.blocklet.com/checkout/session_id',
        credits: 50,
        amount: 500, // in cents
      },
    },
  },

  // Test pricing information
  testGetPricing: {
    endpoint: 'GET /api/payment/credits/pricing',
    description: 'Get credit pricing packages and information',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7'),
    expectedResponse: {
      success: true,
      data: {
        packages: [
          {
            id: 'basic',
            name: 'Basic Package',
            credits: 10,
            price: 100,
            pricePerCredit: 10,
            popular: false,
          },
          // ... other packages
        ],
        currency: 'USD',
        welcomeCredits: 5,
      },
    },
  },

  // Test error scenarios
  testInsufficientCredits: {
    endpoint: 'POST /api/payment/credits/consume',
    description: 'Test insufficient credits error',
    mockRequest: createMockReq('z1muQ3xqHQK2uiACHp4xgHVXXExNDVWxQoHA7', {
      amount: 100, // More than available
    }),
    expectedResponse: {
      error: 'Insufficient credits',
      message: 'Required: 100, Available: 5',
      currentBalance: 5,
    },
  },
};

// Manual testing instructions
const testingInstructions = `
TESTING INSTRUCTIONS FOR PIX-LOOM PAYMENT API

1. Start the development server:
   cd /Users/nategu/work/arcblock/ai-img-apps/pix-loom
   npm run dev

2. Use a tool like Postman, curl, or Thunder Client to test the endpoints:

   Example curl commands:

   # Get credit balance
   curl -H "Content-Type: application/json" \\
        -H "Authorization: Bearer YOUR_TOKEN" \\
        http://localhost:3000/api/payment/credits/balance

   # Claim welcome credits
   curl -X POST \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer YOUR_TOKEN" \\
        http://localhost:3000/api/payment/credits/claim-welcome

   # Consume credits
   curl -X POST \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer YOUR_TOKEN" \\
        -d '{"amount": 1, "operation_type": "image_processing"}' \\
        http://localhost:3000/api/payment/credits/consume

   # Get transaction history
   curl -H "Content-Type: application/json" \\
        -H "Authorization: Bearer YOUR_TOKEN" \\
        http://localhost:3000/api/payment/credits/history

   # Get pricing information
   curl -H "Content-Type: application/json" \\
        http://localhost:3000/api/payment/credits/pricing

3. Test flow:
   - First, get balance (should show isNewUser: true)
   - Claim welcome credits (should add 5 credits)
   - Consume 1 credit for image processing
   - Check balance again (should show 4 credits)
   - Check transaction history (should show both transactions)

4. Error testing:
   - Try to consume more credits than available
   - Try to claim welcome credits twice
   - Test with invalid user authentication

ENVIRONMENT SETUP:
Make sure the following environment variables are set:
- BLOCKLET_PAYMENT_ENDPOINT
- BLOCKLET_PAYMENT_TOKEN

Or configure them in your blocklet's environment settings.
`;

console.log(testingInstructions);

module.exports = {
  testScenarios,
  createMockReq,
  createMockRes,
  testingInstructions,
};