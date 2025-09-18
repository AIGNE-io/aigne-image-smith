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

  // Admin
  admin: {
    // Dashboard
    dashboard: {
      title: 'ImageSmith Admin Dashboard',
      subtitle: 'Manage your AI image application projects',
      projectManagement: {
        title: 'Project Management',
        description: 'Create, edit and manage your AI image application projects',
        action: 'Enter Management',
      },
      quickCreate: {
        title: 'Quick Create',
        description: 'Quickly create a new AI image application project',
        action: 'Create Project',
      },
      previewApp: {
        title: 'Preview App',
        description: 'View the application list page as seen by users',
        action: 'View Apps',
      },
    },

    // Project Management
    projects: {
      title: 'Project Management',
      createProject: 'Create Project',
      loading: 'Loading...',
      error: {
        loadFailed: 'Failed to load project list',
        updateStatusFailed: 'Failed to update project status',
        loginRequired: 'Please log in to access admin dashboard',
      },
      table: {
        name: 'Project Name',
        slug: 'Slug',
        status: 'Status',
        createdAt: 'Created At',
        actions: 'Actions',
      },
      status: {
        active: 'Active',
        draft: 'Draft',
        archived: 'Archived',
      },
      actions: {
        edit: 'Edit Project',
        archive: 'Archive Project',
        restore: 'Restore Project',
      },
      empty: {
        title: 'No Projects',
        description: 'Create your first project',
      },
    },

    // Create Project
    create: {
      title: 'Create New Project',
      sections: {
        urlPath: {
          title: 'Project URL Path',
          required: true,
          placeholder: 'my-awesome-project',
          helperText: 'URL path identifier for the project, only lowercase letters, numbers and hyphens allowed',
        },
        content: {
          title: 'Project Basic Information',
        },
        promptTemplate: {
          title: 'AI Prompt Template',
          required: true,
          placeholder: 'Enter the prompt template for AI image processing, supports variable replacement...',
          helperText: 'This will be used as the base prompt for AI image processing, at least 10 characters required',
        },
        controlsConfig: {
          title: 'Input & Control Configuration',
          inputType: {
            label: 'Input Type',
            image: 'Image Input',
            text: 'Text Input',
          },
        },
        uiConfig: {
          title: 'UI Feature Configuration',
          showComparisonSlider: {
            title: 'Show Comparison Slider',
            description: 'Display before/after comparison slider on result page',
          },
        },
      },
      validation: {
        missingRequired:
          'Please fill in project slug, complete information for at least one language (project name, subtitle, description, OpenGraph image URL) and AI prompt template',
        createFailed: 'Failed to create project',
      },
      actions: {
        cancel: 'Cancel',
        create: 'Create Project',
        creating: 'Creating...',
      },
    },

    // Edit Project
    edit: {
      title: 'Edit Project',
      loading: 'Loading...',
      error: {
        projectNotFound: 'Project does not exist or has been disabled',
        loadFailed: 'Failed to load project',
        projectIdRequired: 'Project ID cannot be empty',
      },
      validation: {
        missingRequired:
          'Please fill in project slug, complete information for at least one language (project name, subtitle, description, OpenGraph image URL) and AI prompt template',
        updateFailed: 'Failed to update project',
      },
      actions: {
        cancel: 'Cancel',
        save: 'Save Changes',
        saving: 'Saving...',
      },
    },
  },

  // Components
  components: {
    // Project Content Editor
    projectContentEditor: {
      title: 'Project Basic Information',
      name: {
        label: 'Project Name',
        placeholder: 'Enter project name...',
        copyTooltip: 'Copy from other language',
      },
      subtitle: {
        label: 'Project Subtitle',
        placeholder: 'Enter project subtitle...',
      },
      description: {
        label: 'User Guide',
        placeholder: 'Enter user guide...',
        helperText: 'Describe the functionality and purpose of the project in detail',
      },
      seoImageUrl: {
        label: 'OpenGraph Image',
        uploadTitle: 'Upload OpenGraph Image',
        uploadDescription: 'Select preview image for social media sharing',
        uploadButton: 'Select Image',
        previewAlt: 'OpenGraph preview image',
        helperText: 'Preview image for social media sharing',
        supportText: 'Supports JPG, PNG formats, recommended size 1200x630 pixels',
      },
      copyMenu: {
        title: 'Copy from the following languages:',
      },
      required: '*',
    },

    // Controls Config Editor
    controlsConfigEditor: {
      inputConfiguration: {
        title: 'Input Configuration',
        imageSize: {
          label: 'Image Size',
          helperText: 'Number of images required for this AI application',
        },
        requirements: {
          label: 'Requirements Description',
          placeholderImage: 'Describe image requirements to users...',
          placeholderText: 'Describe text input requirements to users...',
          helperTextImage: 'Describe image requirements to users in different languages',
          helperTextText: 'Describe text input requirements to users in different languages',
        },
      },
      controlComponents: {
        title: 'Control Components',
        addControl: 'Add Control',
        noControls: 'No control components configured. Add some to provide users with customization options.',
        types: {
          select: 'Select Dropdown',
          slider: 'Slider',
          number: 'Number Input',
          text: 'Text Input',
          backgroundSelector: 'Background Selector',
        },
      },
      controlConfig: {
        untitled: 'Untitled Control',
        key: {
          label: 'Control Key',
          helperText: 'Used in prompt template as {{key}}',
        },
        label: {
          label: 'Label',
        },
        description: {
          label: 'Description (optional)',
        },
        required: 'Required field',
        removeControl: 'Remove Control',
        // Select Control
        select: {
          allowMultiple: 'Allow multiple selection',
          options: 'Options:',
          addOption: 'Add Option',
          optionValue: 'Value',
          optionLabel: 'Label',
          optionColor: 'Color (optional)',
        },
        // Slider Control
        slider: {
          minValue: 'Min Value',
          maxValue: 'Max Value',
          step: 'Step',
        },
        // Number Control
        number: {
          minValue: 'Min Value (optional)',
          maxValue: 'Max Value (optional)',
          unit: 'Unit (optional)',
        },
        // Text Control
        text: {
          placeholder: 'Placeholder',
          maxLength: 'Max Length (optional)',
        },
        // Background Selector Control
        backgroundSelector: {
          options: 'Background Options:',
          addBackground: 'Add Background',
          value: 'Value',
          label: 'Label',
          color: 'Color',
        },
      },
    },
  },
});
