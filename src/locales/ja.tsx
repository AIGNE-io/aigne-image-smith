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
      imageCount: '{current} / {total} 枚の画像',
      startGenerate: '生成開始',
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

  // プロジェクト一覧ページ
  projects: {
    title: 'AI画像アプリを探索',
    subtitle: '強力なAI駆動の画像アプリケーションを発見し、クリエイティブワークフローを向上させましょう',
    loading: '読み込み中...',
    noProjects: '利用可能な機能がありません',
    comingSoon: 'より多くのエキサイティングな機能にご期待ください',
    launchApp: '開始する',
  },

  // 管理画面
  admin: {
    // ダッシュボード
    dashboard: {
      title: 'ImageSmith 管理画面',
      subtitle: 'AI画像アプリケーションプロジェクトの管理',
      projectManagement: {
        title: 'プロジェクト管理',
        description: 'AI画像アプリケーションプロジェクトの作成、編集、管理',
        action: '管理画面へ',
      },
      quickCreate: {
        title: 'クイック作成',
        description: '新しいAI画像アプリケーションプロジェクトを素早く作成',
        action: 'プロジェクト作成',
      },
      previewApp: {
        title: 'アプリプレビュー',
        description: 'ユーザーが見るアプリケーション一覧ページを確認',
        action: 'アプリを見る',
      },
    },

    // プロジェクト管理
    projects: {
      title: 'プロジェクト管理',
      createProject: 'プロジェクト作成',
      loading: '読み込み中...',
      error: {
        loadFailed: 'プロジェクト一覧の取得に失敗しました',
        updateStatusFailed: 'プロジェクトステータスの更新に失敗しました',
        loginRequired: '管理画面にアクセスするにはログインしてください',
      },
      table: {
        name: 'プロジェクト名',
        slug: 'スラッグ',
        status: 'ステータス',
        usageCount: '使用回数',
        createdAt: '作成日',
        actions: '操作',
      },
      status: {
        active: 'アクティブ',
        draft: '下書き',
        archived: 'アーカイブ済み',
      },
      actions: {
        edit: 'プロジェクト編集',
        archive: 'プロジェクトをアーカイブ',
        restore: 'プロジェクトを復元',
      },
      empty: {
        title: 'プロジェクトがありません',
        description: '最初のプロジェクトを作成',
      },
    },

    // プロジェクト作成
    create: {
      title: '新しいプロジェクトを作成',
      sections: {
        urlPath: {
          title: 'プロジェクトURLパス',
          required: true,
          placeholder: 'my-awesome-project',
          helperText: 'プロジェクトのURLパス識別子、小文字、数字、ハイフンのみ使用可能',
        },
        content: {
          title: 'プロジェクト基本情報',
        },
        promptTemplate: {
          title: 'AIプロンプトテンプレート',
          required: true,
          placeholder: 'AI画像処理用のプロンプトテンプレートを入力、変数置換に対応...',
          helperText: 'AI画像処理時のベースプロンプトとして使用、最低10文字必要',
        },
        controlsConfig: {
          title: '入力・制御設定',
          inputType: {
            label: '入力タイプ',
            image: '画像入力',
            text: 'テキスト入力',
          },
        },
        uiConfig: {
          title: 'UI機能設定',
          showComparisonSlider: {
            title: '比較スライダーを表示',
            description: '結果ページでビフォー・アフター比較スライダーを表示',
          },
        },
      },
      validation: {
        missingRequired:
          'プロジェクトスラッグ、少なくとも1つの言語の完全な情報（プロジェクト名、サブタイトル、説明、OpenGraph画像URL）、AIプロンプトテンプレートを入力してください',
        createFailed: 'プロジェクトの作成に失敗しました',
      },
      actions: {
        cancel: 'キャンセル',
        create: 'プロジェクト作成',
        creating: '作成中...',
      },
    },

    // プロジェクト編集
    edit: {
      title: 'プロジェクト編集',
      loading: '読み込み中...',
      error: {
        projectNotFound: 'プロジェクトが存在しないか無効化されています',
        loadFailed: 'プロジェクトの読み込みに失敗しました',
        projectIdRequired: 'プロジェクトIDが空です',
      },
      validation: {
        missingRequired:
          'プロジェクトスラッグ、少なくとも1つの言語の完全な情報（プロジェクト名、サブタイトル、説明、OpenGraph画像URL）、AIプロンプトテンプレートを入力してください',
        updateFailed: 'プロジェクトの更新に失敗しました',
      },
      actions: {
        cancel: 'キャンセル',
        save: '変更を保存',
        saving: '保存中...',
      },
    },
  },

  // テキスト入力コンポーネント
  textInput: {
    placeholder: 'コンテンツを入力してください...',
    shortcut: 'Ctrl/Cmd + Enter で高速生成',
    characterCount: '文字',
    clear: 'クリア',
    loginToGenerate: 'ログインして生成開始',
    startGenerate: '生成開始',
  },

  // コンポーネント
  components: {
    // プロジェクトコンテンツエディター
    projectContentEditor: {
      title: 'プロジェクト基本情報',
      name: {
        label: 'プロジェクト名',
        placeholder: 'プロジェクト名を入力...',
        copyTooltip: '他の言語からコピー',
      },
      subtitle: {
        label: 'プロジェクトサブタイトル',
        placeholder: 'プロジェクトサブタイトルを入力...',
      },
      description: {
        label: 'ユーザーガイド',
        placeholder: 'ユーザーガイドを入力...',
        helperText: 'プロジェクトの機能と目的を詳細に説明してください',
      },
      seoImageUrl: {
        label: 'OpenGraph画像',
        uploadTitle: 'OpenGraph画像をアップロード',
        uploadDescription: 'ソーシャルメディア共有用のプレビュー画像を選択',
        uploadButton: '画像を選択',
        previewAlt: 'OpenGraphプレビュー画像',
        helperText: 'ソーシャルメディア共有用のプレビュー画像',
        supportText: 'JPG、PNG形式に対応、推奨サイズ 1200x630 ピクセル',
      },
      copyMenu: {
        title: '以下の言語からコピー:',
      },
      required: '*',
    },

    // コントロール設定エディター
    controlsConfigEditor: {
      inputConfiguration: {
        title: '入力設定',
        imageSize: {
          label: '画像数',
          helperText: 'このAIアプリケーションに必要な画像数',
        },
        requirements: {
          label: '要件説明',
          placeholderImage: 'ユーザーに画像要件を説明...',
          placeholderText: 'ユーザーにテキスト入力要件を説明...',
          helperTextImage: '異なる言語でユーザーに画像要件を説明',
          helperTextText: '異なる言語でユーザーにテキスト入力要件を説明',
        },
      },
      controlComponents: {
        title: 'コントロールコンポーネント',
        addControl: 'コントロール追加',
        noControls:
          'コントロールコンポーネントが設定されていません。ユーザーにカスタマイズオプションを提供するために追加してください。',
        types: {
          select: 'セレクトドロップダウン',
          slider: 'スライダー',
          number: '数値入力',
          text: 'テキスト入力',
          backgroundSelector: '背景セレクター',
        },
      },
      controlConfig: {
        untitled: '無題のコントロール',
        key: {
          label: 'コントロールキー',
          helperText: 'プロンプトテンプレートで {{key}} として使用',
        },
        label: {
          label: 'ラベル',
        },
        description: {
          label: '説明（オプション）',
        },
        required: '必須フィールド',
        removeControl: 'コントロールを削除',
        // Selectコントロール
        select: {
          allowMultiple: '複数選択を許可',
          options: 'オプション:',
          addOption: 'オプションを追加',
          optionValue: '値',
          optionLabel: 'ラベル',
          optionColor: '色（オプション）',
        },
        // Sliderコントロール
        slider: {
          minValue: '最小値',
          maxValue: '最大値',
          step: 'ステップ',
        },
        // Numberコントロール
        number: {
          minValue: '最小値（オプション）',
          maxValue: '最大値（オプション）',
          unit: '単位（オプション）',
        },
        // Textコントロール
        text: {
          placeholder: 'プレースホルダー',
          maxLength: '最大長（オプション）',
        },
        // Background Selectorコントロール
        backgroundSelector: {
          options: '背景オプション:',
          addBackground: '背景を追加',
          value: '値',
          label: 'ラベル',
          color: '色',
        },
      },
    },
  },
});
