'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const invalidToken = !token

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.')
      setState('error')
      return
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg =
          data?.errors?.[0]?.message ||
          data?.message ||
          'Something went wrong. Please try again.'
        setErrorMsg(msg)
        setState('error')
        return
      }

      setState('success')
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  return (
    <div className="template-minimal">
      <div className="template-minimal__wrap">

        {/* ── Invalid / missing token ── */}
        {invalidToken && (
          <div className="login">
            <h1>Invalid Link</h1>
            <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              This password reset link is missing or has expired. Please request a new one from the
              admin login page.
            </p>
            <a href="/admin/login" className="btn btn--style-primary btn--size-large">
              Back to Login
            </a>
          </div>
        )}

        {/* ── Success state ── */}
        {!invalidToken && state === 'success' && (
          <div className="login">
            <h1>Password Updated</h1>
            <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <a href="/admin/login" className="btn btn--style-primary btn--size-large">
              Go to Admin Login
            </a>
          </div>
        )}

        {/* ── Form ── */}
        {!invalidToken && state !== 'success' && (
          <div className="login">
            <h1>Reset your password</h1>
            <p className="login__description" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Enter a new password for your account.
            </p>

            <form onSubmit={handleSubmit} noValidate className="login__form form">

              <div className="field-type password">
                <label className="label" htmlFor="new-password">New Password</label>
                <div className="input-wrap">
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setState('idle') }}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="field-type password" style={{ marginTop: '1rem' }}>
                <label className="label" htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrap">
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setState('idle') }}
                    required
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {state === 'error' && errorMsg && (
                <div className="error-message" style={{ marginTop: '1rem', color: 'var(--theme-error-500, #e05252)', fontSize: '0.875rem' }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-submit" style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="btn btn--style-primary btn--size-large"
                >
                  {state === 'loading' ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>

            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <a href="/admin/login" style={{ fontSize: '0.875rem' }}>
                Back to login
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
