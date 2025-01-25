import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Form, FormGroup, Input } from 'reactstrap'
import { useEffect, useState } from 'react'
import { updateStateObj } from '../../helper'
import { retrieveProduct, updateProduct } from '../../managers/productManager'

const FormItem = (product, setProduct, item, placeholder = item, type = 'text') => {
  return (
    <FormGroup>
      <Input
        className='profile-form__item profile-form__first-name'
        type={type}
        value={product[item]}
        placeholder={placeholder}
        onChange={(e) => updateStateObj(setProduct, item, e.target.value)}
      />
    </FormGroup>
  )
}

export const EditProduct = ({ loggedInUser, setLoggedInUser }) => {
  const [product, setProduct] = useState({})
  const { productId } = useParams()
  const [isModified, setIsModified] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState(null)
  const [imageKey, setImageKey] = useState(false)
  const navigate = useNavigate()

  const { data: productData, isLoading } = useQuery({
    queryKey: [`product${productId}`, productId],
    queryFn: () => retrieveProduct(productId),
    enabled: !!productId,
  })

  const resetImageKey = () => {
    setImageKey(!imageKey)
  }

  const handleSaveChanges = (e) => {
    e.preventDefault()

    product.price = Number(product.price)
    product.quantity = Number(product.quantity)

    if (product.price < 0.01) {
      window.alert('Please enter a valid price.')
      return
    }

    const formData = new FormData()
    formData.append('label', product.label)
    formData.append('price', product.price)
    formData.append('description', product.description)
    formData.append('quantity', product.quantity)
    if (selectedImage) formData.append('image', selectedImage)

    updateProduct(formData, productId).then((updatedProduct) => {
      if (updatedProduct.valid) {
        const { valid, ...productItems } = updatedProduct
        setProduct(productItems)
        setIsModified(false)
        setSelectedImage(null)
        setSelectedImageUrl(null)
        window.alert('Your changes have been saved.')
        navigate(`/products/${productItems.id}`)
      } else {
        window.alert(updatedProduct.message || updatedProduct.error)
      }
    })
  }

  useEffect(() => {
    if (!isLoading) {
      setProduct(productData)
    }
  }, [productData, isLoading])

  useEffect(() => {
    if (!isLoading) {
      setIsModified(false)
      for (const i in productData) {
        if (i in product && productData[i] !== product[i]) {
          setIsModified(true)
        }
      }
    }
  }, [isLoading, product, productData])

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage)
      setSelectedImageUrl(url)
      setIsModified(true)

      return () => URL.revokeObjectURL(url)
    } else {
      setSelectedImageUrl(null)
    }
  }, [selectedImage])

  if (isLoading) {
    return <div className='loading center-txt'>Loading...</div>
  }

  if (!!productData.error || !!productData.message) {
    return <Navigate to='/newproduct' replace />
  }

  return (
    <Form className='product-form'>
      {selectedImageUrl || product.image ? (
        <img className='product-form__image' src={selectedImageUrl || product.image} alt={'product'} />
      ) : (
        <img className='product-form__image' src={'/assets/placeholder.jpg'} alt={'product'} />
      )}

      {FormItem(product, setProduct, 'label', 'Title')}
      {FormItem(product, setProduct, 'price', 'Price', 'number')}

      <FormGroup>
        <Input
          type='file'
          key={imageKey}
          id='image'
          accept='image/*'
          onChange={(e) => setSelectedImage(e.target.files[0])}
          className='product-form__file-input'
        />
      </FormGroup>

      {FormItem(product, setProduct, 'description', 'Description', 'textarea')}
      {FormItem(product, setProduct, 'quantity', 'Quantity', 'number')}

      {isModified ? (
        <button className='profile__save-btn profile__save-btn__enabled' onClick={(e) => handleSaveChanges(e)}>
          Save Changes
        </button>
      ) : (
        <button className='profile__save-btn' disabled>
          Save Changes
        </button>
      )}
    </Form>
  )
}
