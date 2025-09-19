import flat from 'flat';

export default flat({
  home: {
    title: 'AI圖像生成 – 釋放您的創造力',
    subtitle: 'AI圖像生成・創作',
    credits: 'Credits',

    // 歡迎禮包
    welcome: {
      title: '🎉 歡迎新用戶！',
      description: '獲得 5 個免費 Credits 開始創作之旅',
      claim: '領取',
    },

    // 餘額不足
    balance: {
      insufficient: '餘額不足提醒',
      description: '您的Credit餘額不足，需要充值後才能使用AI生成服務',
      recharge: '立即充值',
    },

    // 錯誤提示
    error: {
      title: '操作失敗',
      uploadFailed: '上傳失敗，請重試',
      loginRequired: '請先登入後再使用AI生成服務',
      insufficientCredits: 'Credit餘額不足',
      insufficientCreditsRetry: 'Credit餘額不足',
      noImage: '請先上傳圖片',
      aiFailed: 'AI處理失敗',
      processingFailed: '圖片處理失敗，請重試',
      networkError: '網路連接失敗，請檢查網路後重試',
      authError: '用戶認證失敗，請重新登入',
      serviceUnavailable: 'AI服務暫時不可用，請稍後重試',
      downloadFailed: '下載失敗，請重試',
      claimFailed: '領取失敗，請重試',
      createOrderFailed: '創建充值訂單失敗',
      createOrderError: '創建充值訂單時發生錯誤',
      missingRequiredFields: '請填寫以下必填項：{fields}',
      invalidRequiredFields: '請檢查並填寫所有必填項',
      textInputRequired: '請輸入文字內容',
    },

    // 處理狀態
    processing: {
      magic: 'AI正在施展魔法...',
      wait: '請耐心等待生成完成',
      uploading: '正在上傳到AI伺服器…',
      analyzing: '正在分析圖像內容…',
      preparing: '正在準備生成算法…',
      generating: '正在生成新圖像…',
      enhancing: '正在增強圖像質量…',
      finalizing: '正在完善生成過程…',
      almost: '即將完成，正在添加最後的修飾…',
      complete: '生成完成！',
    },

    // 圖片狀態
    image: {
      original: '原始',
      restored: 'AI生成',
      processing: '處理中的原圖',
      history: '歷史生成',
      originalImage: '原始圖片',
      restoredImage: '生成後圖片',
    },

    // 空狀態
    empty: {
      result: 'AI生成結果將在此處展示',
      waiting: '等待創意的魔法降臨...',
    },

    // 按鈕和操作
    actions: {
      download: '下載圖片',
      retry: '重新生成',
      viewLarge: '查看大圖',
      delete: '刪除',
    },

    // 分享
    share: {
      title: '分享',
    },

    // 歷史記錄
    history: {
      title: '📚 生成歷史',
      loading: '載入中...',
      loadMore: '載入更多',
      countUnit: '項',
    },

    // 上傳組件
    uploader: {
      title: '上傳您的圖像',
      clickToSelect: '點擊下方按鈕選擇圖片',
      description: 'AI圖像生成・創作',
      selectButton: '選擇圖片開始生成',
      imageCount: '{current} / {total} 張圖片',
      startGenerate: '開始生成',
    },

    // 使用指南
    userGuide: {
      title: '使用指南',
      defaultDescription: '上傳圖片開始AI生成',
    },

    // 刪除確認對話框
    deleteConfirm: {
      title: '確認刪除',
      message: '您確定要刪除這張生成的圖片嗎？這個操作不可恢復。',
      confirm: '刪除',
      cancel: '取消',
      deleting: '刪除中...',
      success: '刪除成功',
      failed: '刪除失敗，請重試',
    },

    // 生成狀態
    generating: '生成中...',
  },

  // 專案列表頁面
  projects: {
    title: '探索 AI 圖像應用',
    subtitle: '發現強大的 AI 驅動圖像應用，提升您的創意工作流程',
    loading: '載入中...',
    noProjects: '暫無可用功能',
    comingSoon: '敬請期待更多精彩功能',
    launchApp: '開始使用',
  },

  // 管理後台
  admin: {
    // 首頁
    dashboard: {
      title: 'ImageSmith 管理後台',
      subtitle: '管理您的 AI 圖片應用專案',
      projectManagement: {
        title: '專案管理',
        description: '創建、編輯和管理您的 AI 圖片應用專案',
        action: '進入管理',
      },
      quickCreate: {
        title: '快速創建',
        description: '快速創建一個新的 AI 圖片應用專案',
        action: '創建專案',
      },
      previewApp: {
        title: '預覽應用',
        description: '查看用戶看到的應用列表頁面',
        action: '查看應用',
      },
    },

    // 專案管理
    projects: {
      title: '專案管理',
      createProject: '創建專案',
      loading: '載入中...',
      error: {
        loadFailed: '獲取專案列表失敗',
        updateStatusFailed: '更新專案狀態失敗',
        loginRequired: '請先登入以訪問管理後台',
      },
      table: {
        name: '專案名稱',
        slug: 'Slug',
        status: '狀態',
        usageCount: '使用次數',
        createdAt: '創建時間',
        actions: '操作',
      },
      status: {
        active: '活躍',
        draft: '草稿',
        archived: '已歸檔',
      },
      actions: {
        edit: '編輯專案',
        archive: '歸檔專案',
        restore: '恢復專案',
      },
      empty: {
        title: '暫無專案',
        description: '創建第一個專案',
      },
    },

    // 創建專案
    create: {
      title: '創建新專案',
      sections: {
        urlPath: {
          title: '專案URL路徑',
          required: true,
          placeholder: 'my-awesome-project',
          helperText: '專案的URL路徑標識符，只能包含小寫字母、數字和短橫線',
        },
        content: {
          title: '專案基本信息',
        },
        promptTemplate: {
          title: 'AI 提示詞模板',
          required: true,
          placeholder: '請輸入用於AI圖片處理的提示詞模板，支持變量替換...',
          helperText: '這將作為AI處理圖片時的基礎提示詞，至少需要10個字符',
        },
        controlsConfig: {
          title: '輸入與控制配置',
          inputType: {
            label: '輸入類型',
            image: '圖片輸入',
            text: '文本輸入',
          },
        },
        uiConfig: {
          title: 'UI 功能配置',
          showComparisonSlider: {
            title: '顯示對比滑塊',
            description: '在處理結果頁面顯示前後對比滑塊',
          },
        },
      },
      validation: {
        missingRequired:
          '請填寫專案slug、至少完整填寫一種語言的所有信息（專案名稱、副標題、描述、OpenGraph圖片URL）和AI提示詞模板',
        createFailed: '創建專案失敗',
      },
      actions: {
        cancel: '取消',
        create: '創建專案',
        creating: '創建中...',
      },
    },

    // 編輯專案
    edit: {
      title: '編輯專案',
      loading: '載入中...',
      error: {
        projectNotFound: '專案不存在或已被禁用',
        loadFailed: '載入專案失敗',
        projectIdRequired: '專案ID不能為空',
      },
      validation: {
        missingRequired:
          '請填寫專案slug、至少完整填寫一種語言的所有信息（專案名稱、副標題、描述、OpenGraph圖片URL）和AI提示詞模板',
        updateFailed: '更新專案失敗',
      },
      actions: {
        cancel: '取消',
        save: '保存更改',
        saving: '保存中...',
      },
    },
  },

  // 文字輸入組件
  textInput: {
    placeholder: '請輸入您的內容...',
    shortcut: 'Ctrl/Cmd + Enter 快速生成',
    characterCount: '字符',
    clear: '清除',
    loginToGenerate: '登錄以開始生成',
    startGenerate: '開始生成',
  },

  // 組件
  components: {
    // 專案內容編輯器
    projectContentEditor: {
      title: '專案基本信息',
      name: {
        label: '專案名稱',
        placeholder: '輸入專案名稱...',
        copyTooltip: '從其他語言複製',
      },
      subtitle: {
        label: '專案副標題',
        placeholder: '輸入專案副標題...',
      },
      description: {
        label: '使用指南',
        placeholder: '輸入使用指南...',
        helperText: '詳細描述專案的功能和用途',
      },
      seoImageUrl: {
        label: 'OpenGraph 圖片',
        uploadTitle: '上傳 OpenGraph 圖片',
        uploadDescription: '選擇用於社交媒體分享的預覽圖片',
        uploadButton: '選擇圖片',
        previewAlt: 'OpenGraph 預覽圖片',
        helperText: '用於社交媒體分享的預覽圖片',
        supportText: '支持 JPG、PNG 格式，建議尺寸 1200x630 像素',
      },
      copyMenu: {
        title: '從以下語言複製:',
      },
      required: '*',
    },

    // 控制配置編輯器
    controlsConfigEditor: {
      inputConfiguration: {
        title: '輸入配置',
        imageSize: {
          label: '圖片數量',
          helperText: '此AI應用需要的圖片數量',
        },
        requirements: {
          label: '需求描述',
          placeholderImage: '向用戶描述圖片需求...',
          placeholderText: '向用戶描述文本輸入需求...',
          helperTextImage: '用不同語言向用戶描述圖片需求',
          helperTextText: '用不同語言向用戶描述文本輸入需求',
        },
      },
      controlComponents: {
        title: '控制組件',
        addControl: '添加控制項',
        noControls: '未配置控制組件。添加一些來為用戶提供自定義選項。',
        types: {
          select: '下拉選擇',
          slider: '滑塊',
          number: '數字輸入',
          text: '文本輸入',
          backgroundSelector: '背景選擇器',
        },
      },
      controlConfig: {
        untitled: '無標題控制項',
        key: {
          label: '控制項鍵',
          helperText: '在提示詞模板中使用 {{key}}',
        },
        label: {
          label: '標籤',
        },
        description: {
          label: '描述（可選）',
        },
        required: '必填欄位',
        removeControl: '刪除控制項',
        // Select 控制項
        select: {
          allowMultiple: '允許多選',
          options: '選項:',
          addOption: '添加選項',
          optionValue: '值',
          optionLabel: '標籤',
          optionColor: '顏色（可選）',
        },
        // Slider 控制項
        slider: {
          minValue: '最小值',
          maxValue: '最大值',
          step: '步長',
        },
        // Number 控制項
        number: {
          minValue: '最小值（可選）',
          maxValue: '最大值（可選）',
          unit: '單位（可選）',
        },
        // Text 控制項
        text: {
          placeholder: '佔位符',
          maxLength: '最大長度（可選）',
        },
        // Background Selector 控制項
        backgroundSelector: {
          options: '背景選項:',
          addBackground: '添加背景',
          value: '值',
          label: '標籤',
          color: '顏色',
        },
      },
    },
  },
});
