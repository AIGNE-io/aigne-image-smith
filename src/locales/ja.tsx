import flat from 'flat';

export default flat({
  home: {
    title: 'AI画像生成 – あなたの創造力を解き放つ',
    subtitle: 'AI画像生成・創作',
    credits: 'クレジット',

    // ウェルカムギフト
    welcome: {
      title: '🎉 新規ユーザー歓迎！',
      description: '創作の旅を始めるために5つの無料クレジットを獲得',
      claim: '受け取る',
    },

    // 残高不足
    balance: {
      insufficient: '残高不足のお知らせ',
      description: 'クレジット残高が不足しています。AI生成サービスをご利用いただくには、チャージが必要です',
      recharge: '今すぐチャージ',
    },

    // エラーメッセージ
    error: {
      title: '操作に失敗しました',
      uploadFailed: 'アップロードに失敗しました。再度お試しください',
      loginRequired: 'AI生成サービスをご利用いただくには、まずログインしてください',
      insufficientCredits: 'クレジット残高が不足です',
      insufficientCreditsRetry: 'クレジット残高が不足です',
      noImage: 'まず画像をアップロードしてください',
      aiFailed: 'AI処理に失敗しました',
      processingFailed: '画像処理に失敗しました。再度お試しください',
      networkError: 'ネットワーク接続に失敗しました。ネットワークを確認して再度お試しください',
      authError: 'ユーザー認証に失敗しました。再度ログインしてください',
      serviceUnavailable: 'AIサービスが一時的に利用できません。しばらくしてから再度お試しください',
      downloadFailed: 'ダウンロードに失敗しました。再度お試しください',
      claimFailed: '受け取りに失敗しました。再度お試しください',
      createOrderFailed: 'チャージ注文の作成に失敗しました',
      createOrderError: 'チャージ注文作成中にエラーが発生しました',
    },

    // 処理状況
    processing: {
      magic: 'AIが魔法をかけています...',
      wait: '生成完了まで少々お待ちください',
      uploading: 'AIサーバーにアップロード中...',
      analyzing: '画像の内容を分析中...',
      preparing: '生成アルゴリズムを準備中...',
      generating: '新しい画像を生成中...',
      enhancing: '画像品質を向上中...',
      finalizing: '生成プロセスを完成中...',
      almost: 'もうすぐ完了、最終仕上げ中...',
      complete: '生成完了！',
    },

    // 画像状態
    image: {
      original: 'オリジナル',
      restored: 'AI生成',
      processing: '処理中のオリジナル',
      history: '履歴生成',
      originalImage: 'オリジナル画像',
      restoredImage: '生成された画像',
    },

    // 空の状態
    empty: {
      result: 'AI生成結果がここに表示されます',
      waiting: '創造の魔法の到来を待っています...',
    },

    // アクション
    actions: {
      download: '画像をダウンロード',
      retry: '生成をやり直す',
      viewLarge: '大きな画像を見る',
      delete: '削除',
    },

    // 共有
    share: {
      title: 'シェア',
    },

    // 履歴
    history: {
      title: '📚 生成履歴',
      loading: '読み込み中...',
      loadMore: 'もっと見る',
      countUnit: '件',
    },

    // アップローダーコンポーネント
    uploader: {
      title: 'あなたの画像をアップロード',
      clickToSelect: '下のボタンをクリックして画像を選択',
      description: 'AI画像生成・創作',
      selectButton: '画像を選んで生成開始',
    },

    // ユーザーガイド
    userGuide: {
      title: 'ユーザーガイド',
      defaultDescription: '画像をアップロードしてAI生成を開始',
    },

    // 削除確認ダイアログ
    deleteConfirm: {
      title: '削除の確認',
      message: 'この生成された画像を削除してもよろしいですか？この操作は元に戻せません。',
      confirm: '削除',
      cancel: 'キャンセル',
      deleting: '削除中...',
      success: '削除成功',
      failed: '削除に失敗しました。再度お試しください',
    },
  },
});
