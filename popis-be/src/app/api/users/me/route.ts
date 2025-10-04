import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
	try {
		const payload = await getPayload({ config: configPromise })
		const { user } = await payload.auth({ headers: request.headers })

		if (!user) {
			return Response.json(
				{ success: false, error: 'Unauthorized' },
				{ status: 401 },
			)
		}

		// Only volunteers (users collection) are supported by this endpoint
		if (user.collection !== 'users') {
			return Response.json(
				{ success: false, error: 'Only volunteers can access this endpoint' },
				{ status: 403 },
			)
		}

		// Re-fetch with depth for relations like school
		const fullUser = await payload.findByID({
			collection: 'users',
			id: user.id,
			depth: 1,
		})

		return Response.json({ success: true, user: fullUser })
	} catch (error: any) {
		return Response.json(
			{ success: false, error: error.message },
			{ status: 500 },
		)
	}
}

export const PATCH = async (request: NextRequest) => {
	try {
		const payload = await getPayload({ config: configPromise })
		const { user } = await payload.auth({ headers: request.headers })

		if (!user) {
			return Response.json(
				{ success: false, error: 'Unauthorized' },
				{ status: 401 },
			)
		}

		if (user.collection !== 'users') {
			return Response.json(
				{ success: false, error: 'Only volunteers can update this resource' },
				{ status: 403 },
			)
		}

		const body = await request.json().catch(() => ({}))
		const { firstName, lastName, isStudent, school } = body || {}

		const updateData: any = {}
		if (typeof firstName === 'string') updateData.firstName = firstName
		if (typeof lastName === 'string') updateData.lastName = lastName
		if (typeof isStudent === 'boolean') updateData.isStudent = isStudent
		// school can be string id or null
		if (school === null || typeof school === 'string') {
			updateData.school = school
		}
		// If isStudent explicitly false, ensure school is cleared
		if (isStudent === false) updateData.school = null

		const updated = await payload.update({
			collection: 'users',
			id: user.id,
			data: updateData,
			depth: 1,
		})

		return Response.json({ success: true, doc: updated })
	} catch (error: any) {
		return Response.json(
			{ success: false, error: error.message },
			{ status: 500 },
		)
	}
}


