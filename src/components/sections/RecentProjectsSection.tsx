import { Link } from '@/i18n/navigation'
import ProjectsCarousel from './ProjectsCarousel'

const FALLBACK_PROJECTS = [
  { id: 'f1', slug: 'kai-tak-cruise-terminal',       title: 'Kai Tak Cruise Terminal',         image: '/images/project-katak.jpg'  },
  { id: 'f2', slug: 'hysan-place',                   title: 'Hysan Place',                     image: '/images/project-hysan.jpg'  },
  { id: 'f3', slug: 'tamar-development-project',     title: 'Tamar Development Project',       image: '/images/project-tamar.jpg'  },
  { id: 'f4', slug: 'international-commerce-centre', title: 'International Commerce Centre',   image: '/images/project-ifc.jpg'    },
  { id: 'f5', slug: 'altira-macau',                  title: 'Altira Macau',                    image: '/images/project-altira.jpg' },
]

const FALLBACK_IMAGES: Record<string, string> = {
  'kai-tak-cruise-terminal':       '/images/project-katak.jpg',
  'hysan-place':                   '/images/project-hysan.jpg',
  'tamar-development-project':     '/images/project-tamar.jpg',
  'international-commerce-centre': '/images/project-ifc.jpg',
  'altira-macau':                  '/images/project-altira.jpg',
}

interface Props { projects: any[]; locale: string; homePageData?: any }

export default function RecentProjectsSection({ projects, locale, homePageData }: Props) {
  const raw = projects?.length ? projects : FALLBACK_PROJECTS

  // Normalise into a flat shape the carousel understands
  const items = raw.map((p: any) => ({
    id:     String(p.id),
    slug:   p.slug || '#',
    title:  p.title || 'Project',
    imgSrc: p.coverImage?.url || p.image || FALLBACK_IMAGES[p.slug] || FALLBACK_PROJECTS[0].image,
    imgAlt: p.coverImage?.alt || p.title || 'Project',
  }))

  const eyebrow    = homePageData?.projectsSectionLabel || 'WHAT WE DO'
  const heading    = homePageData?.projectsSectionTitle || 'RECENT PROJECTS'
  const ctaText    = homePageData?.projectsCtaText      || 'VIEW MORE'
  const ctaHref    = homePageData?.projectsCtaHref      || '/projects'

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-8 lg:px-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#000] mb-1">{eyebrow}</p>
          <h2 className="section-title text-[#10242b] text-2xl font-normal">{heading}</h2>
        </div>

        {/* Carousel */}
        <ProjectsCarousel projects={items} locale={locale} />

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href={ctaHref as any}
            className="button-section inline-block"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  )
}
