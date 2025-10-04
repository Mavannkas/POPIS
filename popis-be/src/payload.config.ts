// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { pl } from '@payloadcms/translations/languages/pl'

import { Users } from './collections/Users'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Applications } from './collections/Applications'
import { Certificates } from './collections/Certificates'
import { Schools } from './collections/Schools'
import { Invitations } from './collections/Invitations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    components: {
      graphics: {
        Logo: '@/components/AdminLogoBig/AdminLogoBig#AdminLogoBig',
        Icon: '@/components/AdminLogoIcon/AdminLogoIcon#AdminLogoIcon',
      },
      Nav: {
        path: '@/components/AdminNavbar#AdminNavbar',
      },
    },
    meta: {
      titleSuffix: '- Popis',
    },
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: {
      pl,
    },
  },
  collections: [Users, Admins, Media, Events, Applications, Certificates, Schools, Invitations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    push: true,
    client: {
      url: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [payloadCloudPlugin()],
})
