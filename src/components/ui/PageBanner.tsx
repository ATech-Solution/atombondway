import Image from 'next/image'

interface Props {
  src?: string
  alt?: string
}

export default function PageBanner({ src = '/images/hero-bg.jpg', alt = '' }: Props) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 200 }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      {/* subtle dark overlay so text on top stays readable */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  )
}
