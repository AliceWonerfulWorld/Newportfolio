# 3. アーキテクチャ・コンポーネント設計 (Architecture & Components)

本プロジェクトでは、Astroの「アイランドアーキテクチャ」を軸に、静的生成による高速な基盤と、React/GSAPによる動的な「遊び心」を分離・共存させる。

## 3.1 ディレクトリ構造の詳細役割

```text
src/
 ├── assets/           # 画像、独自フォント、静的リソース
 ├── components/
 │    ├── common/      # 全ページ共通のAstroパーツ（Header, Footer, CustomCursor等）
 │    ├── islands/     # 【React専用】状態(State)を持つ動的コンポーネント
 │    ├── ui/          # 汎用的なAstro UIパーツ（独自デザインのButton, Tag, Link等）
 │    └── views/       # ページ構成用の大きなAstroセクション（Hero.astro, WorksList.astro等）
 ├── content/          # 記事・作品データ（MDX）と型定義（config.ts）
 ├── layouts/          # 共通レイアウト（BaseLayout.astro, PostLayout.astro）
 ├── pages/            # ルーティング（index.astro, blog/[slug].astro 等）
 ├── styles/           # グローバルCSS、CSS変数（variables.css）
 └── utils/            # 共通ロジック
      └── animations.ts # GSAPのアニメーション定義（インクの飛び散り、スクロール制御等）

3.2 コンポーネントの使い分けルール (Astro vs React)
AIによる無秩序なReactの使用を制限し、パフォーマンスとUXを最適化する。

原則: Astroを使用する (Default to Astro)

対象: テキスト、静的な画像、リンク、ページの大枠、SEOに関わる部分。

理由: クライアントサイドのJavaScriptを最小限に抑え、LCP（最大視覚コンテンツの表示時間）を高速化するため。

例外: Reactを使用する (Opt-in to React)

場所: src/components/islands/ 配下。

条件: 以下のいずれかに該当する場合のみ。

ユーザーの入力（クリック、ドラッグ、文字入力）に即時反応するインタラクティブ性が必要な場合（例：タイピングゲーム、フィルター）。

マウス座標に追従する、または複雑な数学的計算を伴うパーティクルエフェクト（例：インクのしぶき）。

React Three Fiber など、Reactのエコシステムに依存した3D/AR表現。

呼び出し: Astro側で client:load や client:visible を使用してハイドレーションを制御する。

3.3 スタイリングとアニメーションの設計
CSS Modules (NO TAILWIND):

Astroコンポーネントはファイル内の <style> タグを使用。

Reactコンポーネントは [ComponentName].module.css を使用。

デザインの「遊び心（非対称性、角度、重なり）」は各コンポーネントのCSSで厳密に管理する。

GSAPの責務分離:

アニメーションの「タイムライン構築ロジック」は src/utils/animations.ts に関数として定義する。

コンポーネント側（Astroの <script> または Reactの useEffect）では、その関数をインポートしてDOM要素に適用する。

3.4 データの流れ (Data Flow)
データ追加: ドクターが src/content/ にMDXを追加。

スキーマ検証: src/content/config.ts で定義したZodスキーマに基づき、ビルド時に型チェックを実行。

静的生成: 各ページ（[slug].astro 等）がデータを取得し、HTMLを生成。

動的拡張: MDX内で呼び出されたReactコンポーネントのみがクライアントで動作し、ドキュメントに「体験」を付与する。