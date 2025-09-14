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
});
