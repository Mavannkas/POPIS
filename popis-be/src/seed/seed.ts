import { config as dotenvConfig } from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from './index'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const run = async () => {
  const payload = await getPayload({ config })

  await seed(payload)

  process.exit(0)
}

run()
