import { Link } from '@/i18n/navigation'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-[#034F98] text-6xl font-bold mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#10242b] mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}
