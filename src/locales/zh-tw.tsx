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
  },
});
