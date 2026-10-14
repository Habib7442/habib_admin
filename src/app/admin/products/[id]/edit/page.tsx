import { notFound } from 'next/navigation'
import { ProductForm, type ProductInitial } from '@/components/admin/ProductForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateProduct } from '../../actions'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<ProductInitial | null>(
    `*[_type == "product" && _id == $id][0]{
      name, oneLiner, link, status, order, "alt": image.alt, "imageUrl": image.asset->url
    }`,
    { id }
  )
  if (!doc) notFound()

  return <ProductForm heading="Edit product" submitLabel="Save changes" action={updateProduct.bind(null, id)} initial={doc} />
}
