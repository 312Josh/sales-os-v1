import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function login(formData: FormData) {
  'use server'
  const password = String(formData.get('password') || '')
  const next = String(formData.get('next') || '/')
  const expected = process.env.AUTH_PASSWORD || ''

  if (!expected || password !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`)
  }

  const jar = await cookies()
  jar.set('sales_os_auth', expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  })

  redirect(next || '/')
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams
  const next = params.next || '/'
  const hasError = params.error === '1'

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-sales-900">Sales OS Login</h1>
          <p className="text-sm text-slate-500 mt-2">Shared access for Josh and Paul.</p>
        </div>
        <form action={login} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input name="password" type="password" required className="w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          {hasError && <p className="text-sm text-red-600">Incorrect password.</p>}
          <button type="submit" className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5">Enter Sales OS</button>
        </form>
      </div>
    </main>
  )
}
