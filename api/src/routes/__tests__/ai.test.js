/**
 * Integration tests for AI image generation API endpoints
 * This file provides manual testing scenarios and examples
 */

// Mock test data
const testScenarios = {
  // Test AI image generation
  testGeneration: {
    endpoint: 'POST /api/ai/generate',
    description: 'Generate AI processed image with credit consumption',
    mockRequest: {
      body: {
        originalImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&grayscale',
        operationType: 'colorization',
        metadata: {
          filename: 'vintage_family_photo.jpg',
          source: 'user_upload',
          description: 'Family photo from the 1950s'
        }
      }
    },
    expectedResponse: {
      success: true,
      data: {
        generationId: 'gen_abc123',
        originalImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&grayscale',
        generatedImageUrl: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&h=600&fit=crop',
        operationType: 'colorization',
        processingTimeMs: 2340,
        creditsConsumed: 1,
        newBalance: 4,
        status: 'completed',
        message: 'colorization completed successfully'
      }
    }
  },

  // Test different operation types
  testRestorationGeneration: {
    endpoint: 'POST /api/ai/generate',
    description: 'Test photo restoration operation',
    mockRequest: {
      body: {
        originalImageUrl: 'https://example.com/damaged_photo.jpg',
        operationType: 'restoration',
        metadata: {
          filename: 'damaged_photo.jpg',
          damage_type: 'scratches_and_tears'
        }
      }
    }
  },

  testEnhancementGeneration: {
    endpoint: 'POST /api/ai/generate',
    description: 'Test image enhancement operation',
    mockRequest: {
      body: {
        originalImageUrl: 'https://example.com/blurry_photo.jpg',
        operationType: 'enhancement',
        metadata: {
          filename: 'blurry_photo.jpg',
          enhancement_type: 'sharpening'
        }
      }
    }
  },

  testStyleTransfer: {
    endpoint: 'POST /api/ai/generate',
    description: 'Test style transfer operation',
    mockRequest: {
      body: {
        originalImageUrl: 'https://example.com/portrait.jpg',
        operationType: 'style_transfer',
        metadata: {
          filename: 'portrait.jpg',
          style: 'impressionist'
        }
      }
    }
  },

  // Test generation status check
  testGetStatus: {
    endpoint: 'GET /api/ai/generation/:id',
    description: 'Get status of a specific generation',
    mockRequest: {
      params: { id: 'gen_abc123' }
    },
    expectedResponse: {
      success: true,
      data: {
        id: 'gen_abc123',
        originalImageUrl: 'https://example.com/original.jpg',
        generatedImageUrl: 'https://generated-url.com/result.jpg',
        operationType: 'colorization',
        status: 'completed',
        creditsConsumed: 1,
        processingTimeMs: 2340,
        errorMessage: null,
        metadata: { filename: 'vintage_photo.jpg' },
        createdAt: '2025-02-09T18:00:00.000Z',
        updatedAt: '2025-02-09T18:00:02.340Z'
      }
    }
  },

  // Test generation history
  testGetHistory: {
    endpoint: 'GET /api/ai/history?limit=10&operationType=colorization',
    description: 'Get user generation history with filtering',
    mockRequest: {
      query: { limit: 10, operationType: 'colorization' }
    },
    expectedResponse: {
      success: true,
      data: {
        generations: [
          {
            id: 'gen_abc123',
            originalImageUrl: 'https://example.com/original.jpg',
            generatedImageUrl: 'https://generated-url.com/result.jpg',
            operationType: 'colorization',
            status: 'completed',
            creditsConsumed: 1,
            processingTimeMs: 2340,
            createdAt: '2025-02-09T18:00:00.000Z'
          }
        ],
        pagination: {
          total: 5,
          limit: 10,
          offset: 0,
          hasMore: false
        },
        statistics: {
          totalGenerations: 15,
          completedGenerations: 14,
          totalCreditsSpent: 15,
          successRate: 93.33
        }
      }
    }
  },

  // Test user statistics
  testGetStats: {
    endpoint: 'GET /api/ai/stats',
    description: 'Get comprehensive user generation statistics',
    expectedResponse: {
      success: true,
      data: {
        totalGenerations: 25,
        completedGenerations: 23,
        totalCreditsSpent: 25,
        successRate: 92.0,
        recentActivity: 8,
        period: '30 days'
      }
    }
  },

  // Test error scenarios
  testInsufficientCredits: {
    endpoint: 'POST /api/ai/generate',
    description: 'Test insufficient credits error',
    mockRequest: {
      body: {
        operationType: 'colorization'
      }
    },
    expectedResponse: {
      error: 'Insufficient credits',
      message: 'Required: 1, Available: 0',
      currentBalance: 0
    }
  },

  testInvalidOperationType: {
    endpoint: 'POST /api/ai/generate',
    description: 'Test invalid operation type',
    mockRequest: {
      body: {
        operationType: 'invalid_operation'
      }
    },
    expectedResponse: {
      error: 'Invalid request data',
      details: [
        {
          message: '"operationType" must be one of [colorization, restoration, enhancement, style_transfer]'
        }
      ]
    }
  },

  testGenerationNotFound: {
    endpoint: 'GET /api/ai/generation/nonexistent_id',
    description: 'Test generation not found error',
    expectedResponse: {
      error: 'Generation not found',
      message: 'Generation not found or access denied'
    }
  }
};

// Manual testing instructions
const testingInstructions = `
TESTING INSTRUCTIONS FOR PIX-LOOM AI API

1. Start the development server:
   cd /Users/nategu/work/arcblock/ai-img-apps/pix-loom
   npm run dev

2. Make sure you have credits by testing the payment API first:
   curl -X POST -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        http://localhost:3000/api/payment/credits/claim-welcome

3. Test AI generation endpoints:

   # Generate colorized image
   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{
          "originalImageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&grayscale",
          "operationType": "colorization",
          "metadata": {"filename": "test_photo.jpg"}
        }' \\
        http://localhost:3000/api/ai/generate

   # Check generation status
   curl -H "Authorization: Bearer \${TOKEN}" \\
        http://localhost:3000/api/ai/generation/\${GENERATION_ID}

   # Get generation history
   curl -H "Authorization: Bearer \${TOKEN}" \\
        http://localhost:3000/api/ai/history?limit=10

   # Get user statistics
   curl -H "Authorization: Bearer \${TOKEN}" \\
        http://localhost:3000/api/ai/stats

   # Test other operation types
   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{"operationType": "restoration"}' \\
        http://localhost:3000/api/ai/generate

   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{"operationType": "enhancement"}' \\
        http://localhost:3000/api/ai/generate

   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{"operationType": "style_transfer"}' \\
        http://localhost:3000/api/ai/generate

4. Test error scenarios:

   # Test without credits (after consuming all)
   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{"operationType": "colorization"}' \\
        http://localhost:3000/api/ai/generate

   # Test invalid operation type
   curl -X POST \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d '{"operationType": "invalid"}' \\
        http://localhost:3000/api/ai/generate

   # Test invalid generation ID
   curl -H "Authorization: Bearer \${TOKEN}" \\
        http://localhost:3000/api/ai/generation/invalid_id

5. Complete workflow test:
   a) Check credit balance
   b) Generate image (should consume 1 credit)
   c) Check new balance (should be 1 less)
   d) Check generation history (should show new entry)
   e) Get user statistics (should reflect new generation)

6. Database verification:
   Check the image_generations table to ensure records are being created:
   - All fields should be populated correctly
   - Status should progress from 'pending' -> 'processing' -> 'completed'
   - Credits should be consumed and recorded

EXPECTED BEHAVIOR:
- Mock processing takes 1-4 seconds depending on operation type
- Each operation consumes exactly 1 credit
- All operations are recorded in the database
- Generated images are high-quality Unsplash photos
- Processing times are realistic but simulated
- Credit consumption happens before processing starts
- Failed credit consumption prevents processing

INTEGRATION WITH COLOR-MEMORY:
The color-memory frontend can now use these endpoints:
- Replace mock processImage() with real API calls
- Use /api/ai/generate for image processing
- Use /api/ai/history for displaying user's past work
- Use /api/payment/credits/* for credit management
`;

console.log(testingInstructions);

// Utility functions for testing
const createMockReq = (userDid, body = {}, params = {}, query = {}) => ({
  user: { did: userDid },
  body,
  params,
  query,
  ip: '127.0.0.1',
  get: (header) => header === 'User-Agent' ? 'test-agent' : undefined,
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => ({ ...res, statusCode: code });
  res.json = (data) => ({ ...res, data });
  return res;
};

module.exports = {
  testScenarios,
  createMockReq,
  createMockRes,
  testingInstructions,
};