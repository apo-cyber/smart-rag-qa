# Smart RAG QA System

## 概要
Django REST Framework + Next.js 15 で構築されたRAG（Retrieval-Augmented Generation）システム

## 技術スタック
- **Backend**: Django, Django REST Framework
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI**: OpenAI API (モック実装含む)

## セットアップ

### バックエンド
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## 機能
- �� ドキュメントアップロード・管理
- 💬 AI による質問応答
- 📝 会話履歴管理
- 🔍 文書検索・参照元表示
- 📱 レスポンシブUI
