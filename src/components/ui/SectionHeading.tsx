interface Props {
  title: string
  subtitle?: string
  centered?: boolean
  label?: string
  light?: boolean
}

export default function SectionHeading({ title, subtitle, centered, label, light }: Props) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {label && (
        <p
          className={`text-sm font-semibold uppercase tracking-widest mb-2 ${
            light ? 'text-[#6bb3f0]' : 'text-[#034F98]'
          }`}
        >
          {label}
        </p>
      )}
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-[#10242b]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-gray-300' : 'text-gray-500'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
