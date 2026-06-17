'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type TestStatus = 'idle' | 'loading' | 'success' | 'error'

interface TestResult {
  step: string
  status: 'ok' | 'error'
  detail: string
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<TestStatus>('idle')
  const [results, setResults] = useState<TestResult[]>([])

  const runTest = async () => {
    setStatus('loading')
    setResults([])
    const log: TestResult[] = []

    // 1. 檢查環境變數
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const urlOk = !!url && !url.includes('placeholder')
    const keyOk = !!key && !key.includes('placeholder')

    log.push({
      step: '環境變數 NEXT_PUBLIC_SUPABASE_URL',
      status: urlOk ? 'ok' : 'error',
      detail: urlOk ? url! : '未設定或為 placeholder，請在 Vars 設定',
    })
    log.push({
      step: '環境變數 NEXT_PUBLIC_SUPABASE_ANON_KEY',
      status: keyOk ? 'ok' : 'error',
      detail: keyOk ? `${key!.slice(0, 20)}…（已遮蔽）` : '未設定或為 placeholder，請在 Vars 設定',
    })

    if (!urlOk || !keyOk) {
      setResults(log)
      setStatus('error')
      return
    }

    // 2. 嘗試取得目前 Session
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const email = sessionData?.session?.user?.email ?? '（未登入）'
      log.push({
        step: 'Auth getSession()',
        status: 'ok',
        detail: `回應正常，目前使用者：${email}`,
      })
    } catch (err: any) {
      log.push({
        step: 'Auth getSession()',
        status: 'error',
        detail: err?.message ?? String(err),
      })
      setResults(log)
      setStatus('error')
      return
    }

    // 3. 嘗試讀取 transactions 資料表（只讀 1 筆，不需要登入也能看出表是否存在）
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, note, amount, type, date')
        .limit(3)

      if (error) {
        // 表不存在或 RLS 擋住都會進這裡
        log.push({
          step: 'DB 查詢 transactions 表',
          status: 'error',
          detail: `code: ${error.code} — ${error.message}`,
        })
        setResults(log)
        setStatus('error')
        return
      }

      log.push({
        step: 'DB 查詢 transactions 表',
        status: 'ok',
        detail: data.length > 0
          ? `成功，取得 ${data.length} 筆資料`
          : '成功連線，目前資料表為空（0 筆）',
      })
    } catch (err: any) {
      log.push({
        step: 'DB 查詢 transactions 表',
        status: 'error',
        detail: err?.message ?? String(err),
      })
      setResults(log)
      setStatus('error')
      return
    }

    setResults(log)
    setStatus('success')
  }

  const allOk = results.length > 0 && results.every(r => r.status === 'ok')

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">Supabase 連線測試</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            逐步驗證環境變數、Auth 以及 DB 查詢
          </p>
        </div>
        <Button
          onClick={runTest}
          disabled={status === 'loading'}
          variant="outline"
          size="sm"
        >
          {status === 'loading' ? '測試中...' : '開始測試'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm ${
                r.status === 'ok'
                  ? 'bg-[color:var(--income-bg)] text-[color:var(--income)]'
                  : 'bg-[color:var(--expense-bg)] text-[color:var(--expense)]'
              }`}
            >
              <span className="mt-0.5 shrink-0 font-bold">
                {r.status === 'ok' ? '✓' : '✗'}
              </span>
              <div className="min-w-0">
                <p className="font-medium">{r.step}</p>
                <p className="text-xs opacity-80 break-all">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {status !== 'idle' && results.length > 0 && (
        <p className={`text-sm font-medium ${allOk ? 'text-[color:var(--income)]' : 'text-[color:var(--expense)]'}`}>
          {allOk
            ? '所有步驟通過，Supabase 連線正常！'
            : '部分步驟失敗，請依上方訊息排查。'}
        </p>
      )}
    </div>
  )
}
