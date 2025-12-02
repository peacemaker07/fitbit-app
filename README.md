# Fitbit Dashboard - Next.js アプリケーション

このプロジェクトは、Fitbit Web APIを使用して健康データを取得・表示するNext.jsアプリケーションです。

## 機能

- Fitbit OAuth 2.0 認証
- ダッシュボードでのデータ表示:
  - 歩数
  - 消費カロリー
  - 移動距離
  - 階段
  - 安静時心拍数
  - 睡眠時間
- リアルタイムデータ更新

## 技術スタック

- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全性
- **NextAuth.js v5** - OAuth 認証
- **Tailwind CSS** - スタイリング
- **Fitbit Web API** - データソース

## セットアップ手順

### 1. Fitbit アプリケーションの登録

1. [Fitbit Developer Console](https://dev.fitbit.com/apps) にアクセス
2. 新しいアプリケーションを登録
3. 以下の情報を設定:
   - **OAuth 2.0 Application Type**: Personal
   - **Callback URL**: `http://localhost:3000/api/auth/callback/fitbit`
   - **Default Access Type**: Read Only または Read & Write
4. Client ID と Client Secret を保存

### 2. 環境変数の設定

1. `.env.local` ファイルを作成（またはプロジェクトに既にある場合は編集）
2. 以下の環境変数を設定:

```bash
# Fitbit OAuth Configuration
FITBIT_CLIENT_ID=your_fitbit_client_id_here
FITBIT_CLIENT_SECRET=your_fitbit_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

3. `NEXTAUTH_SECRET` を生成するには:

```bash
openssl rand -base64 32
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

1. アプリケーションにアクセスすると、ログイン画面が表示されます
2. 「Fitbitでログイン」ボタンをクリック
3. Fitbitアカウントでログイン・認証
4. ダッシュボードで健康データを確認
5. 「データを更新」ボタンで最新データを取得

## API エンドポイント

- `/api/auth/[...nextauth]` - NextAuth 認証エンドポイント
- `/api/fitbit/activity` - アクティビティデータ取得
- `/api/fitbit/heart` - 心拍数データ取得
- `/api/fitbit/sleep` - 睡眠データ取得
- `/api/fitbit/profile` - プロフィールデータ取得

## プロジェクト構造

```
fitbit-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── fitbit/
│   │       ├── activity/
│   │       │   └── route.ts
│   │       ├── heart/
│   │       │   └── route.ts
│   │       ├── sleep/
│   │       │   └── route.ts
│   │       └── profile/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Dashboard.tsx
├── lib/
│   └── auth.ts
├── types/
│   └── next-auth.d.ts
└── .env.local
```

## トラブルシューティング

### 認証エラー

- Fitbit Developer Console で設定した Callback URL が正しいか確認
- 環境変数が正しく設定されているか確認
- `NEXTAUTH_SECRET` が生成されているか確認

### データが表示されない

- Fitbitアカウントでデバイスが同期されているか確認
- APIスコープが適切に設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認

## 本番環境へのデプロイ

1. Vercel、Netlify などのプラットフォームにデプロイ
2. 環境変数を設定
3. `NEXTAUTH_URL` を本番環境のURLに更新
4. Fitbit Developer Console で本番環境の Callback URL を追加

## ライセンス

MIT

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Fitbit Web API Documentation](https://dev.fitbit.com/build/reference/web-api/)
