import {
  Image,
  type LucideProps,
  ShieldUser,
  Award,
  Calendar,
  FileText,
  Mail,
  School,
  UserCircle,
} from 'lucide-react'
import { type CollectionSlug, type GlobalSlug } from 'payload'
import { type ExoticComponent } from 'react'

export const navIconMap: Partial<
  Record<CollectionSlug | GlobalSlug, ExoticComponent<LucideProps>>
> = {
  admins: ShieldUser,
  certificates: Award,
  events: Calendar,
  applications: FileText,
  invitations: Mail,
  schools: School,
  users: UserCircle,
  media: Image,
}

export const getNavIcon = (slug: string) =>
  Object.hasOwn(navIconMap, slug) ? navIconMap[slug as CollectionSlug | GlobalSlug] : undefined
