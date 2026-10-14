import { ProductForm } from '@/components/admin/ProductForm'
import { requireAuth } from '@/lib/session'
import { createProduct } from '../actions'

export default async function NewProductPage() {
  await requireAuth()
  return <ProductForm heading="Add product" submitLabel="Publish" action={createProduct} />
}
