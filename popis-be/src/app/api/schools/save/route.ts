import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

/**
 * API endpoint to save a school from external API to local cache
 * Frontend will call this when user selects a school
 */
export const POST = async (request: NextRequest) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    const { externalId, name, address, city, postalCode, type } = body
    
    // Validate required fields
    if (!externalId || !name || !city) {
      return Response.json(
        { success: false, error: 'externalId, name, and city are required' },
        { status: 400 }
      )
    }
    
    // Check if school already exists
    const existingSchools = await payload.find({
      collection: 'schools',
      where: {
        externalId: { equals: externalId },
      },
    })
    
    if (existingSchools.docs.length > 0) {
      // School already exists, return it
      return Response.json({
        success: true,
        school: existingSchools.docs[0],
        message: 'School already exists in cache',
      })
    }
    
    // Create new school
    const school = await payload.create({
      collection: 'schools',
      data: {
        externalId,
        name,
        address: address || '',
        city,
        postalCode: postalCode || '',
        type: type || 'other',
      },
    })
    
    return Response.json({
      success: true,
      school,
      message: 'School saved to cache',
    })
  } catch (error: any) {
    console.error('Error saving school:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

