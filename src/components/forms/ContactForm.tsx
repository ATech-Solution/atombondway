'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  locale: string
}

export default function ContactForm({ locale }: Props) {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle size={56} className="text-[#034F98] mb-4" />
        <h4 className="text-xl font-bold text-[#10242b] mb-2">{t('successTitle')}</h4>
        <p className="text-gray-500">{t('successMessage')}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-[#034F98] font-semibold hover:underline"
        >
          {locale === 'zh' ? '發送新訊息' : 'Send another message'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-[#10242b] mb-1.5">
          {t('nameLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder={t('namePlaceholder')}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#034F98] focus:ring-2 focus:ring-[#034F98]/20 transition"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#10242b] mb-1.5">
          {t('emailLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder={t('emailPlaceholder')}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#034F98] focus:ring-2 focus:ring-[#034F98]/20 transition"
        />
      </div>

      {/* Phone + Subject (2 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-[#10242b] mb-1.5">
            {t('phoneLabel')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder={t('phonePlaceholder')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#034F98] focus:ring-2 focus:ring-[#034F98]/20 transition"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-[#10242b] mb-1.5">
            {t('subjectLabel')}
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            placeholder={t('subjectPlaceholder')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#034F98] focus:ring-2 focus:ring-[#034F98]/20 transition"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-[#10242b] mb-1.5">
          {t('messageLabel')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder={t('messagePlaceholder')}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#034F98] focus:ring-2 focus:ring-[#034F98]/20 transition resize-none"
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
          <AlertCircle size={16} className="shrink-0" />
          {t('errorMessage')}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-[#034F98] text-white py-3.5 rounded-full font-semibold text-sm hover:bg-[#023874] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? t('submitting') : t('submitButton')}
      </button>
    </form>
  )
}
