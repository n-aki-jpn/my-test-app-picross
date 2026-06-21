#!/bin/bash

# 外から入力された1番目の文字（リポジトリ名）を取得
REPO_NAME=${1:-my-test-app-picross}

echo "----------------------------------------"
echo "ターゲットURLパス: /${REPO_NAME}"
echo "----------------------------------------"

# 1. 念のためビルドキャッシュを削除
echo "🧹 古いキャッシュを削除しています..."
rm -rf dist .expo

# 2. ビルドを実行
echo "📦 Expo Webのエクスポートを開始します..."
npx expo export --platform web --clear

# 3. HTML内のパスを強制置換
echo "🔧 HTMLの絶対パスを置換しています..."
sed -i "s|href=\"/|href=\"/${REPO_NAME}/|g" dist/index.html
sed -i "s|src=\"/|src=\"/${REPO_NAME}/|g" dist/index.html

# 4. GitHub Pagesの「_expo」隠しフォルダー無視を無効化するファイルを作成
echo "📝 .nojekyll ファイルを作成しています..."
touch dist/.nojekyll

# 5. GitHub Pagesへデプロイ（-t フラグを追加して .nojekyll も強制的に含める）
echo "🚀 GitHub Pagesへデプロイ中..."
npx gh-pages -d dist -t

echo "✅ デプロイが完了しました！"
echo "👉 以下のURLを確認してください（反映に1〜2分かかります）:"
echo "https://n-aki-jpn.github.io/${REPO_NAME}"
