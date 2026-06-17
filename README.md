# Money Mate - 個人記帳應用

一個現代化、簡潔的個人財務記帳應用，幫助你輕鬆追蹤收入和支出。

## 功能特性

- 📊 **詳細統計** - 實時查看收入、支出和結餘
- 💾 **安全存儲** - 數據安全存儲在 Supabase
- ⚡ **快速簡單** - 直觀的界面快速記錄交易
- 📈 **趨勢分析** - 查看近期財務趨勢圖表
- 🏷️ **分類管理** - 按不同分類組織交易

## 技術棧

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts

## 快速開始

### 1. 克隆或創建 GitHub 倉庫

```bash
# 如果還沒創建 GitHub repo，先在 GitHub 上創建一個新倉庫
git clone https://github.com/你的用戶名/money-mate.git
cd money-mate
```

### 2. 安裝依賴

```bash
pnpm install
# 或使用 npm
npm install
# 或使用 yarn
yarn install
```

### 3. 配置環境變數

在根目錄創建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```

你可以從 [Supabase Dashboard](https://supabase.com) 獲得這些值。

### 4. 創建數據庫表

在 Supabase 中執行以下 SQL：

```sql
-- 創建 transactions 表
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 設置 RLS (行級安全)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用戶只能訪問自己的交易" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- 創建索引以提高查詢性能
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### 5. 啟動開發服務器

```bash
pnpm dev
# 應用將在 http://localhost:3000 運行
```

## 本地開發工作流

### 在本地修改代碼

```bash
# 修改文件後，檢查狀態
git status

# 提交更改
git add .
git commit -m "描述你的改動"

# 推送到 GitHub
git push origin main
```

### 在 v0 中同步更改

1. 在 v0 Settings 中連接你的 GitHub repo
2. v0 會自動檢測 GitHub 上的更改
3. 你也可以在本地修改後拉取到 v0

## 部署到 Vercel

### 1. 連接到 Vercel

```bash
# 使用 Vercel CLI 部署
vercel
```

或者在 [Vercel Dashboard](https://vercel.com) 中：
1. 點擊 "Add New Project"
2. 導入你的 GitHub 倉庫
3. 配置環境變數（NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY）

### 2. 配置環境變數

在 Vercel 項目設置中添加：

```
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```

### 3. 自動部署

每次推送到 main 分支時，Vercel 會自動部署你的應用。

## 應用結構

```
money-mate/
├── app/
│   ├── page.tsx              # 首頁
│   ├── auth/
│   │   └── page.tsx          # 認證頁面
│   ├── dashboard/
│   │   └── page.tsx          # 儀表板
│   ├── layout.tsx            # 根 layout
│   └── globals.css           # 全局樣式
├── components/
│   ├── ui/
│   │   └── button.tsx        # shadcn 按鈕組件
│   ├── TransactionForm.tsx   # 交易表單
│   ├── TransactionList.tsx   # 交易列表
│   └── StatisticsCard.tsx    # 統計卡片
├── lib/
│   ├── supabase.ts           # Supabase 配置
│   └── utils.ts              # 工具函數
└── public/                   # 靜態資源
```

## 常見問題

### 如何重置密碼？

在登入頁面點擊"忘記密碼"鏈接，按照郵件說明重置。

### 如何導出我的數據？

目前可以通過 Supabase Dashboard 導出 CSV 文件。

### 多設備同步？

由於數據存儲在 Supabase 雲端，你在任何設備登入同一帳戶都會看到同樣的數據。

## 貢獻

歡迎提交 Pull Request 或報告 Issue！

## 許可證

MIT

## 支持

如有問題，請通過以下方式聯繫：

- 提交 GitHub Issue
- 發送郵件至 support@money-mate.com

---

祝你使用愉快！💰
