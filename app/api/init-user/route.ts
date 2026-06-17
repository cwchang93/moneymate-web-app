import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Create default accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert([
        { user_id: userId, name: '現金', type: 'cash', balance: 0, is_default: true },
        { user_id: userId, name: '銀行', type: 'bank', balance: 0 },
      ])
      .select()

    if (accountsError) throw accountsError

    // Create default categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        { user_id: userId, name: '薪資', type: 'income', sort_order: 1 },
        { user_id: userId, name: '兼職', type: 'income', sort_order: 2 },
        { user_id: userId, name: '投資收益', type: 'income', sort_order: 3 },
        { user_id: userId, name: '食物', type: 'expense', sort_order: 1 },
        { user_id: userId, name: '交通', type: 'expense', sort_order: 2 },
        { user_id: userId, name: '房屋', type: 'expense', sort_order: 3 },
        { user_id: userId, name: '購物', type: 'expense', sort_order: 4 },
        { user_id: userId, name: '娛樂', type: 'expense', sort_order: 5 },
        { user_id: userId, name: '公用事業', type: 'expense', sort_order: 6 },
      ])
      .select()

    if (categoriesError) throw categoriesError

    return NextResponse.json({
      success: true,
      accounts,
      categories,
    })
  } catch (error: any) {
    console.error('Error initializing user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
