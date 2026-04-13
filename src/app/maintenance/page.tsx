/**
 * Under-construction / maintenance page.
 *
 * Zero CMS or database dependencies — renders even when the rest of
 * the application is completely offline.
 *
 * Triggered by setting MAINTENANCE_MODE=true in .env, which causes
 * the middleware to redirect all public traffic here.
 */
import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#10242b] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(3,79,152,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '180px 180px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">

        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/media/logo_atombondway.png"
            alt="Atom Bondway"
            width={260}
            height={60}
            style={{ width: 'auto', height: '52px' }}
            className="object-contain brightness-0 invert"
            priority
          />
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-[#034F98] mb-10" />

        {/* Heading */}
        <h1
          className="text-white font-light tracking-[0.18em] uppercase mb-5"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '0.18em' }}
        >
          Under Construction
        </h1>

        {/* Body */}
        <p className="text-white/50 text-sm leading-relaxed tracking-wide max-w-sm mb-12">
          We are currently working on something new. Our website will be back
          shortly. Thank you for your patience.
        </p>

        {/* Contact pill */}
        <a
          href="mailto:info@atombondway.com.hk"
          className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-xs tracking-widest
                     px-6 py-3 rounded-full
                     hover:border-[#034F98] hover:text-white
                     transition-colors duration-300
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034F98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          info@atombondway.com.hk
        </a>

        {/* Footer note */}
        <p className="mt-16 text-white/20 text-xs tracking-widest">
          Atom Bondway Co. Ltd.
        </p>
      </div>
    </main>
  )
}
