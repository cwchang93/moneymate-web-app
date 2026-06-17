#!/bin/bash

# Money Mate 快速設置腳本

echo "🚀 Money Mate 快速設置"
echo "===================="
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js (https://nodejs.org)"
    exit 1
fi

echo "✓ Node.js 已安裝"

# 檢查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 安裝 pnpm..."
    npm install -g pnpm
fi

echo "✓ pnpm 已安裝"
echo ""

# 檢查是否在項目目錄中
if [ ! -f "package.json" ]; then
    echo "❌ 請在 money-mate 項目目錄中運行此腳本"
    exit 1
fi

echo "📥 安裝依賴..."
pnpm install

echo ""
echo "✓ 依賴已安裝"
echo ""

# 檢查 .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  設置環境變數..."
    echo ""
    read -p "請輸入你的 SUPABASE_URL: " SUPABASE_URL
    read -p "請輸入你的 SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
    
    echo "✓ .env.local 已創建"
else
    echo "✓ .env.local 已存在"
fi

echo ""
echo "✅ 設置完成！"
echo ""
echo "接下來的步驟："
echo "1. 在 Supabase Dashboard 中創建 transactions 表（參考 README.md）"
echo "2. 運行: pnpm dev"
echo "3. 打開瀏覽器訪問: http://localhost:3000"
echo ""
echo "如需幫助，請查看 README.md 或 DEPLOYMENT.md"
