# Money Mate 部署指南

## 部署到 Vercel

### 方法 1：使用 Vercel CLI（推薦用於本地開發）

#### 第 1 步：安裝 Vercel CLI

```bash
npm i -g vercel
```

#### 第 2 步：登入 Vercel

```bash
vercel login
```

#### 第 3 步：部署應用

```bash
vercel
```

系統會提示你：
- 設置項目名稱
- 選擇框架（選擇 Next.js）
- 配置環境變數

#### 第 4 步：配置環境變數

在部署過程中，Vercel 會要求你設置：

```
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```

### 方法 2：通過 GitHub（推薦用於團隊協作）

#### 第 1 步：連接 GitHub

1. 到 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 選擇 "Import Git Repository"
4. 搜索你的 `money-mate` 倉庫並導入

#### 第 2 步：配置環境變數

1. 進入項目設置 → Environment Variables
2. 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 第 3 步：自動部署

現在，每次你 push 到 GitHub 時，Vercel 會自動部署你的應用。

---

## 部署後的配置

### 1. 更新 Supabase 設置

在 Supabase Dashboard 中：

1. 進入 **Settings > Authentication**
2. 在 "Site URL" 中設置你的 Vercel 部署 URL
3. 在 "Redirect URLs" 中添加：
   ```
   https://你的-vercel-url.vercel.app/auth/callback
   https://你的-vercel-url.vercel.app/
   ```

### 2. 驗證部署

訪問你的 Vercel 部署 URL：
```
https://money-mate-你的用戶名.vercel.app
```

應該能看到 Money Mate 首頁。

---

## 常見部署問題

### 問題 1：環境變數未定義

**解決方案**：確保在 Vercel Dashboard 中添加了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

### 問題 2：Supabase 連接失敗

**解決方案**：
1. 檢查環境變數是否正確
2. 確保 Supabase 項目在線
3. 檢查網絡連接

### 問題 3：認證失敗

**解決方案**：
1. 驗證 Supabase 的重定向 URL 設置
2. 確保 Supabase Auth 已啟用

---

## 版本更新

部署後更新應用：

```bash
# 在本地修改代碼
# 提交更改
git add .
git commit -m "描述改動"
git push origin main

# Vercel 會自動部署新版本
```

---

## 性能優化

### 1. 啟用 Image Optimization

在 `next.config.mjs` 中已默認配置。

### 2. 監控性能

在 Vercel Dashboard 中：
- 進入 Analytics
- 查看 Core Web Vitals 指標
- 查看部署日誌

### 3. 查看日誌

```bash
# 查看實時日誌
vercel logs

# 查看構建日誌
vercel logs --follow --source=build
```

---

## 自定義域名（可選）

1. 進入 Vercel 項目 → Settings → Domains
2. 添加你的自定義域名
3. 按照說明更新 DNS 記錄

---

## 回滾到上個版本

如果部署出現問題：

1. 進入 Vercel Dashboard
2. 進入你的項目
3. 進入 Deployments
4. 找到之前的穩定版本
5. 點擊 "Promote to Production"

---

## 支持

如遇問題，請查看：
- [Vercel 文檔](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase 文檔](https://supabase.com/docs)

祝部署順利！
