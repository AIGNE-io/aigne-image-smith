import flat from 'flat';

export default flat({
  home: {
    title: 'AI图像生成 – 释放您的创造力',
    subtitle: 'AI图像生成・创作',
    credits: 'Credits',

    // 欢迎礼包
    welcome: {
      title: '🎉 欢迎新用户！',
      description: '获得 5 个免费 Credits 开始创作之旅',
      claim: '领取',
    },

    // 余额不足
    balance: {
      insufficient: '余额不足提醒',
      description: '您的Credit余额不足，需要充值后才能使用AI生成服务',
      recharge: '立即充值',
    },

    // 错误提示
    error: {
      title: '操作失败',
      uploadFailed: '上传失败，请重试',
      loginRequired: '请先登录后再使用AI生成服务',
      insufficientCredits: 'Credit余额不足',
      insufficientCreditsRetry: 'Credit余额不足',
      noImage: '请先上传图片',
      aiFailed: 'AI处理失败',
      processingFailed: '图片处理失败，请重试',
      networkError: '网络连接失败，请检查网络后重试',
      authError: '用户认证失败，请重新登录',
      serviceUnavailable: 'AI服务暂时不可用，请稍后重试',
      downloadFailed: '下载失败，请重试',
      claimFailed: '领取失败，请重试',
      createOrderFailed: '创建充值订单失败',
      createOrderError: '创建充值订单时发生错误',
    },

    // 处理状态
    processing: {
      magic: 'AI正在施展魔法...',
      wait: '请耐心等待生成完成',
      uploading: '正在上传到AI服务器…',
      analyzing: '正在分析图像内容…',
      preparing: '正在准备生成算法…',
      generating: '正在生成新图像…',
      enhancing: '正在增强图像质量…',
      finalizing: '正在完善生成过程…',
      almost: '即将完成，正在添加最后的修饰…',
      complete: '生成完成！',
    },

    // 图片状态
    image: {
      original: '原始',
      restored: 'AI生成',
      processing: '处理中的原图',
      history: '历史生成',
      originalImage: '原始图片',
      restoredImage: '生成后图片',
    },

    // 空状态
    empty: {
      result: 'AI生成结果将在此处展示',
      waiting: '等待创意的魔法降临...',
    },

    // 按钮和操作
    actions: {
      download: '下载图片',
      retry: '重新生成',
      viewLarge: '查看大图',
      delete: '删除',
    },

    // 分享
    share: {
      title: '分享',
    },

    // 历史记录
    history: {
      title: '📚 生成历史',
      loading: '加载中...',
      loadMore: '加载更多',
      countUnit: '项',
    },

    // 上传组件
    uploader: {
      title: '上传您的图像',
      clickToSelect: '点击下方按钮选择图片',
      description: 'AI图像生成・创作',
      selectButton: '选择图片开始生成',
      imageCount: '{current} / {total} 张图片',
      startGenerate: '开始生成',
    },

    // 使用指南
    userGuide: {
      title: '使用指南',
      defaultDescription: '上传图片开始AI生成',
    },

    // 删除确认弹窗
    deleteConfirm: {
      title: '确认删除',
      message: '您确定要删除这张生成的图片吗？这个操作不可恢复。',
      confirm: '删除',
      cancel: '取消',
      deleting: '删除中...',
      success: '删除成功',
      failed: '删除失败，请重试',
    },
  },

  // 项目列表页面
  projects: {
    title: '探索 AI 图像应用',
    subtitle: '发现强大的 AI 驱动图像应用，提升您的创意工作流程',
    loading: '加载中...',
    noProjects: '暂无可用功能',
    comingSoon: '敬请期待更多精彩功能',
    launchApp: '开始使用',
  },

  // 管理后台
  admin: {
    // 首页
    dashboard: {
      title: 'ImageSmith 管理后台',
      subtitle: '管理您的 AI 图片应用项目',
      projectManagement: {
        title: '项目管理',
        description: '创建、编辑和管理您的 AI 图片应用项目',
        action: '进入管理',
      },
      quickCreate: {
        title: '快速创建',
        description: '快速创建一个新的 AI 图片应用项目',
        action: '创建项目',
      },
      previewApp: {
        title: '预览应用',
        description: '查看用户看到的应用列表页面',
        action: '查看应用',
      },
    },

    // 项目管理
    projects: {
      title: '项目管理',
      createProject: '创建项目',
      loading: '加载中...',
      error: {
        loadFailed: '获取项目列表失败',
        updateStatusFailed: '更新项目状态失败',
        loginRequired: '请先登录以访问管理后台',
      },
      table: {
        name: '项目名称',
        slug: 'Slug',
        status: '状态',
        usageCount: '使用次数',
        createdAt: '创建时间',
        actions: '操作',
      },
      status: {
        active: '活跃',
        draft: '草稿',
        archived: '已归档',
      },
      actions: {
        edit: '编辑项目',
        archive: '归档项目',
        restore: '恢复项目',
      },
      empty: {
        title: '暂无项目',
        description: '创建第一个项目',
      },
    },

    // 创建项目
    create: {
      title: '创建新项目',
      sections: {
        urlPath: {
          title: '项目URL路径',
          required: true,
          placeholder: 'my-awesome-project',
          helperText: '项目的URL路径标识符，只能包含小写字母、数字和短横线',
        },
        content: {
          title: '项目基本信息',
        },
        promptTemplate: {
          title: 'AI 提示词模板',
          required: true,
          placeholder: '请输入用于AI图片处理的提示词模板，支持变量替换...',
          helperText: '这将作为AI处理图片时的基础提示词，至少需要10个字符',
        },
        controlsConfig: {
          title: '输入与控制配置',
          inputType: {
            label: '输入类型',
            image: '图片输入',
            text: '文本输入',
          },
        },
        uiConfig: {
          title: 'UI 功能配置',
          showComparisonSlider: {
            title: '显示对比滑块',
            description: '在处理结果页面显示前后对比滑块',
          },
        },
      },
      validation: {
        missingRequired:
          '请填写项目slug、至少完整填写一种语言的所有信息（项目名称、副标题、描述、OpenGraph图片URL）和AI提示词模板',
        createFailed: '创建项目失败',
      },
      actions: {
        cancel: '取消',
        create: '创建项目',
        creating: '创建中...',
      },
    },

    // 编辑项目
    edit: {
      title: '编辑项目',
      loading: '加载中...',
      error: {
        projectNotFound: '项目不存在或已被禁用',
        loadFailed: '加载项目失败',
        projectIdRequired: '项目ID不能为空',
      },
      validation: {
        missingRequired:
          '请填写项目slug、至少完整填写一种语言的所有信息（项目名称、副标题、描述、OpenGraph图片URL）和AI提示词模板',
        updateFailed: '更新项目失败',
      },
      actions: {
        cancel: '取消',
        save: '保存更改',
        saving: '保存中...',
      },
    },
  },

  // 组件
  components: {
    // 项目内容编辑器
    projectContentEditor: {
      title: '项目基本信息',
      name: {
        label: '项目名称',
        placeholder: '输入项目名称...',
        copyTooltip: '从其他语言复制',
      },
      subtitle: {
        label: '项目副标题',
        placeholder: '输入项目副标题...',
      },
      description: {
        label: '使用指南',
        placeholder: '输入使用指南...',
        helperText: '详细描述项目的功能和用途',
      },
      seoImageUrl: {
        label: 'OpenGraph 图片',
        uploadTitle: '上传 OpenGraph 图片',
        uploadDescription: '选择用于社交媒体分享的预览图片',
        uploadButton: '选择图片',
        previewAlt: 'OpenGraph 预览图片',
        helperText: '用于社交媒体分享的预览图片',
        supportText: '支持 JPG、PNG 格式，建议尺寸 1200x630 像素',
      },
      copyMenu: {
        title: '从以下语言复制:',
      },
      required: '*',
    },

    // 控制配置编辑器
    controlsConfigEditor: {
      inputConfiguration: {
        title: '输入配置',
        imageSize: {
          label: '图片数量',
          helperText: '此AI应用需要的图片数量',
        },
        requirements: {
          label: '需求描述',
          placeholderImage: '向用户描述图片需求...',
          placeholderText: '向用户描述文本输入需求...',
          helperTextImage: '用不同语言向用户描述图片需求',
          helperTextText: '用不同语言向用户描述文本输入需求',
        },
      },
      controlComponents: {
        title: '控制组件',
        addControl: '添加控件',
        noControls: '未配置控制组件。添加一些来为用户提供自定义选项。',
        types: {
          select: '下拉选择',
          slider: '滑块',
          number: '数字输入',
          text: '文本输入',
          backgroundSelector: '背景选择器',
        },
      },
      controlConfig: {
        untitled: '无标题控件',
        key: {
          label: '控件键',
          helperText: '在提示词模板中使用 {{key}}',
        },
        label: {
          label: '标签',
        },
        description: {
          label: '描述（可选）',
        },
        required: '必填字段',
        removeControl: '删除控件',
        // Select 控件
        select: {
          allowMultiple: '允许多选',
          options: '选项:',
          addOption: '添加选项',
          optionValue: '值',
          optionLabel: '标签',
          optionColor: '颜色（可选）',
        },
        // Slider 控件
        slider: {
          minValue: '最小值',
          maxValue: '最大值',
          step: '步长',
        },
        // Number 控件
        number: {
          minValue: '最小值（可选）',
          maxValue: '最大值（可选）',
          unit: '单位（可选）',
        },
        // Text 控件
        text: {
          placeholder: '占位符',
          maxLength: '最大长度（可选）',
        },
        // Background Selector 控件
        backgroundSelector: {
          options: '背景选项:',
          addBackground: '添加背景',
          value: '值',
          label: '标签',
          color: '颜色',
        },
      },
    },
  },
});
