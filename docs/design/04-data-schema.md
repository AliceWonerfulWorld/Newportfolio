# 4. データスキーマ設計 (Data Schema Design)

Astro Content Collections を使用し、作品紹介（Works）と開発記（Blog）のデータ構造を Zod で定義する。これにより、コンテンツ追加時のバリデーションを自動化し、型の安全性を担保する。

## 4.1 Works (プロダクト・実績) スキーマ

`src/content/works/` 配下に格納される。作品のデモ、リポジトリ、外部記事へのリンクを統合管理する。

| フィールド名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| **title** | string | ○ | 作品名 |
| **description** | string | ○ | 作品の短い概要（一覧表示用） |
| **pubDate** | Date | ○ | 公開日・制作日 |
| **thumbnail** | Image | ○ | サムネイル画像（Astroによる自動最適化対象） |
| **tags** | string[] | ○ | 使用技術スタック（React, GSAP, IoT等） |
| **links** | object[] | - | 関連リンクの配列（type, url） |
| **featured** | boolean | - | トップページの「Selected Works」に表示するかどうか |

### リンクオブジェクトの構成
- **type:** 'github' | 'demo' | 'article' | 'other'
- **url:** string (url形式)

## 4.2 Blog (開発記・考察) スキーマ

`src/content/blog/` 配下に格納される。

| フィールド名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| **title** | string | ○ | 記事タイトル |
| **description** | string | ○ | 記事の概要（SEO/一覧用） |
| **pubDate** | Date | ○ | 公開日 |
| **updatedDate**| Date | - | 更新日 |
| **heroImage** | Image | - | 記事のヘッダー画像 |
| **tags** | string[] | ○ | カテゴリタグ |

## 4.3 実装上の注意点 (Zod Validation)

`src/content/config.ts` において、以下のルールを適用する。

1. **画像のパス:** `thumbnail` や `heroImage` は、`src/assets/images/` 内の相対パスとして解決し、ビルド時に WebP/AVIF へ自動変換されるように設定する。
2. **日付の自動パース:** 文字列で記述された日付（YYYY-MM-DD）を JavaScript の Date オブジェクトへ自動変換する。
3. **リンクの重複防止:** リンク配列が定義されている場合、少なくとも一つのURLが有効であることを確認する。