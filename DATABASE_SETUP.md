# MoneyMate 数据库设置指南

## 问题

目前应用无法正常运行，因为 Supabase 数据库中还没有创建所需的表。您会看到错误信息：
- "Could not find the table 'public.accounts' in the schema cache"
- "Could not find a relationship between 'transactions' and 'accounts'"

## 解决方案

您需要在 Supabase 中执行 SQL 脚本来创建数据库表。

### 步骤 1: 打开 Supabase SQL Editor

1. 访问 [Supabase 控制面板](https://app.supabase.com)
2. 选择您的项目：`moneymate-web-app`
3. 在左侧菜单中选择 **SQL Editor**
4. 点击 **New Query** 创建新查询

### 步骤 2: 复制并执行 SQL

打开文件 `/scripts/init-supabase.sql` 并复制其中的所有 SQL 代码。

将整个 SQL 脚本粘贴到 SQL Editor 中，然后点击 **Run** 按钮。

脚本会创建以下表：
- ✅ `accounts` - 帐户表
- ✅ `categories` - 分类表  
- ✅ `transactions` - 交易记录表

同时会设置所有行级别安全 (RLS) 策略，确保用户只能访问自己的数据。

### 步骤 3: 验证

执行完 SQL 后，您应该看到所有查询都成功（绿色检查标记）。

现在您可以：
1. 刷新应用
2. 登入账户
3. 新增交易记录

## 如果遇到错误

- 如果看到 "relation already exists" 错误，说明表已存在，继续即可
- 如果看到权限错误，请确保您使用的是 Supabase 项目的 owner 账户

## 默认数据初始化

首次登入应用时，系统会自动为您创建默认的帐户和分类：

**默认帐户:**
- 現金 (cash)
- 銀行 (bank)

**默认分类:**
- 收入: 薪資、兼職、投資收益
- 支出: 食物、交通、房屋、購物、娛樂、公用事業

您可以在应用中修改或添加更多帐户和分类。
