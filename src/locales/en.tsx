import flat from 'flat';

export default flat({
  home: {
    title: 'AI Image Generation – Unleash Your Creativity',
    subtitle: 'AI Image Generation & Creation',
    credits: 'Credits',

    // Welcome gift
    welcome: {
      title: '🎉 Welcome New User!',
      description: 'Get 5 free Credits to start your creative journey',
      claim: 'Claim',
    },

    // Insufficient balance
    balance: {
      insufficient: 'Insufficient Balance',
      description: 'Your Credit balance is insufficient. Please recharge to use AI generation service',
      recharge: 'Recharge Now',
    },

    // Error message
    error: {
      title: 'Operation Failed',
      uploadFailed: 'Upload failed, please try again',
      loginRequired: 'Please log in first to use AI generation service',
      insufficientCredits: 'Credit balance insufficient',
      insufficientCreditsRetry: 'Credit balance insufficient',
      noImage: 'Please upload an image first',
      aiFailed: 'AI processing failed',
      processingFailed: 'Image processing failed, please try again',
      networkError: 'Network connection failed, please check network and try again',
      authError: 'User authentication failed, please log in again',
      serviceUnavailable: 'AI service temporarily unavailable, please try again later',
      downloadFailed: 'Download failed, please try again',
      claimFailed: 'Claim failed, please try again',
      createOrderFailed: 'Failed to create recharge order',
      createOrderError: 'Error occurred while creating recharge order',
    },

    // Processing status
    processing: {
      magic: 'AI is casting magic...',
      wait: 'Please wait patiently for generation to complete',
      uploading: 'Uploading to AI server...',
      analyzing: 'Analyzing image content...',
      preparing: 'Preparing generation algorithms...',
      generating: 'Generating new image...',
      enhancing: 'Enhancing image quality...',
      finalizing: 'Finalizing generation process...',
      almost: 'Almost done, adding finishing touches...',
      complete: 'Generation complete!',
    },

    // Image status
    image: {
      original: 'Original',
      restored: 'AI Generated',
      processing: 'Processing Original',
      history: 'History Generated',
      originalImage: 'Original Image',
      restoredImage: 'Generated Image',
    },

    // Empty state
    empty: {
      result: 'AI generation results will be displayed here',
      waiting: 'Waiting for creative magic to arrive...',
    },

    // Actions
    actions: {
      download: 'Download Image',
      retry: 'Retry Generation',
      viewLarge: 'View Large Image',
      delete: 'Delete',
    },

    // Share
    share: {
      title: 'Share',
    },

    // History
    history: {
      title: '📚 Generation History',
      loading: 'Loading...',
      loadMore: 'Load More',
      countUnit: 'items',
    },

    // Uploader component
    uploader: {
      title: 'Upload Your Image',
      clickToSelect: 'Click the button below to select image',
      description: 'AI Image Generation & Creation',
      selectButton: 'Select Image to Start Generation',
      imageCount: '{current} / {total} images',
      startGenerate: 'Start Generate',
    },

    // User Guide
    userGuide: {
      title: 'User Guide',
      defaultDescription: 'Upload an image to start AI generation',
    },

    // Delete confirmation dialog
    deleteConfirm: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this generated image? This action cannot be undone.',
      confirm: 'Delete',
      cancel: 'Cancel',
      deleting: 'Deleting...',
      success: 'Deleted successfully',
      failed: 'Delete failed, please try again',
    },
  },

  // Projects list page
  projects: {
    title: 'Explore AI Image Apps',
    subtitle: 'Discover powerful AI-driven image applications that transform your creative workflow',
    loading: 'Loading...',
    noProjects: 'No available features',
    comingSoon: 'Stay tuned for more exciting features',
    launchApp: 'Get Started',
  },
});
