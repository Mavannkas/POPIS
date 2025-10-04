import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from './index'

const run = async () => {
  const payload = await getPayload({ config })

  await seed(payload)

  process.exit(0)
}

run()
