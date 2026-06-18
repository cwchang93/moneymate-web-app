# 資料庫修復說明（schema 不一致問題）

這份文件記錄了一次「資料庫表結構錯誤」的問題、原因，以及修復方式。
如果之後又遇到類似錯誤，照這份做即可。

---

## 一、症狀（會看到的錯誤）

網頁上出現紅色橫幅「⚠️ 數據庫配置錯誤」，且瀏覽器 console 出現以下其中之一：

| 錯誤碼 / 訊息 | 意思 |
|---|---|
| `PGRST205` — `Could not find the table 'public.accounts'` | `accounts` 表不存在 |
| `Could not find the 'account_id' column of 'transactions'` | `transactions` 表缺少 `account_id` 欄位 |
| `PGRST200` — `Could not find a relationship between 'transactions' and 'accounts'` | 因為上面兩件事，外鍵關係建不起來 |

---

## 二、根本原因

**這不是前端程式碼的問題，是 Supabase 資料庫本身的 schema 跟程式碼預期對不上。**

具體來說，資料庫之前是用一份「舊版 SQL」建立的：

- `transactions` 表**沒有** `account_id` 欄位
- **完全沒有建立** `accounts` 表

但前端程式碼（`app/dashboard/page.tsx`、`components/TransactionForm.tsx`）會去查 `accounts` 表、也會寫入 `transactions.account_id`，所以一執行就報錯。

> 為什麼「改了程式碼還是壞」？
> 因為程式碼怎麼改都不會自動去 Supabase 建表或加欄位。
> 資料表結構必須在 Supabase 端用 SQL 修正。

另外要注意：**PostgREST 有 schema cache（快取）**。就算建好了表，快取沒刷新仍可能回報「找不到」。本專案的修復腳本最後一行 `NOTIFY pgrst, 'reload schema';` 就是用來強制刷新快取。

---

## 三、修復方式

因為 `transactions` 表已存在但結構錯誤，**不能只補建，必須先砍掉重建**。

### 步驟

1. 打開 Supabase Dashboard → 左側工具列的 **SQL Editor**（`</>` 圖示）
   - 網址格式：`https://supabase.com/dashboard/project/<你的專案ID>/sql/new`
2. 把 [`scripts/reset-supabase.sql`](./reset-supabase.sql) **整份**內容貼進去
3. 按右下角 **Run**（或 `⌘ + Enter`）
4. 看到 **`Success. No rows returned`** 就代表成功（建表/建 policy 本來就不回傳資料）
5. 回到網頁 `localhost:3000/dashboard`，用 `⌘ + Shift + R` 強制重整

### 修復腳本做了什麼

`scripts/reset-supabase.sql` 依序執行：

1. **DROP** 舊的 `transactions` / `categories` / `accounts` 三張表（`CASCADE`）
2. **重建** 三張表，這次 `transactions` 帶有正確的 `account_id` 外鍵
3. 重新建立全部 **RLS（Row Level Security）policy**，確保每位使用者只能存取自己的資料
4. `NOTIFY pgrst, 'reload schema';` 刷新 PostgREST 快取

> ⚠️ 此腳本會清空 `accounts` / `categories` / `transactions` 的所有資料。
> 不會動到 `budgets` 表。
> 因為這三張表本來就壞掉、也沒有正式資料，所以直接重建沒有損失。

---

## 四、驗證是否修好

修復後可這樣確認：

- 網頁上方紅色「數據庫配置錯誤」橫幅**消失**
- 登入後系統會自動建立「現金 / 銀行」兩個預設帳戶與預設分類
- 「新增交易」可以正常儲存
- 在 Supabase **Table Editor** 可看到 `accounts` 表已出現，且 `transactions` 多了 `account_id` 欄位

---

## 五、常見踩雷

- **不要在 Table Editor 貼 SQL** —— SQL 要在 **SQL Editor** 執行。
- **複製時只框選 SQL 內容** —— 不要把說明文字（例如 `⚠️ 注意…`）一起複製進編輯器，否則會報 `syntax error`。
- 若重整後仍報「找不到表/欄位」，到 Supabase **Settings → API → Reload schema cache** 手動再刷一次。
