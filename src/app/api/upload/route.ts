import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/session'
import { imageError, uploadImage } from '@/lib/sanity'

/** Uploads one image to Sanity and returns its asset id. Admin only. */
export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  const err = imageError(file)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  try {
    const asset = await uploadImage(file)
    return NextResponse.json({ assetId: asset._id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Upload to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }, { status: 500 })
  }
}
