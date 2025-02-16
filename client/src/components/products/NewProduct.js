import { useNavigate } from 'react-router-dom'
import { Form, FormGroup, Input } from 'reactstrap'
import { useState, useEffect } from 'react'
import { updateStateObj } from '../../helper'
import { createProduct } from '../../managers/productManager'

const FormItem = (product, setProduct, item, placeholder = item, type = 'text') => {
  return (
    <FormGroup>
      <Input
        className={`product-form__item product-form__${item}`}
        type={type}
        value={product[item]}
        placeholder={placeholder}
        onChange={(e) => updateStateObj(setProduct, item, e.target.value)}
      />
    </FormGroup>
  )
}

export const NewProduct = ({ loggedInUser, setLoggedInUser, isDeal = false }) => {
  const [product, setProduct] = useState({
    label: '',
    price: '',
    description: '',
    quantity: '',
    image: null,
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState(null)
  const [imageKey, setImageKey] = useState(false)
  const navigate = useNavigate()

  const resetImageKey = () => {
    setImageKey(!imageKey)
  }

  const handleCreateProduct = (e) => {
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
    // formData.append('is_deal', isDeal)

    createProduct(formData)
      .then((createdProduct) => {
        if (createdProduct.valid) {
          const { valid, ...productItems } = createdProduct
          setProduct(productItems)
          window.alert('Your changes have been saved.')
          navigate(`/products/${productItems.id}`)
        } else {
          if (createdProduct.message === 'Missing property(s)') {
            window.alert('Please finish choosing the: ' + createdProduct.missing_props.join(', '))
          } else {
            window.alert(createdProduct.message || createdProduct.error)
          }
        }
      })
      .catch((error) => {
        if (error.message === 'Failed to fetch') {
          window.alert('Unable to upload to server. Please check your internet connection, or use a smaller image.')
        } else {
          window.alert('An error occurred while creating this product. Please try again later.')
        }
        console.error('Error creating product:', error)
      })
  }

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage)
      setSelectedImageUrl(url)

      // clean up object url during component unmount
      return () => URL.revokeObjectURL(url)
    } else {
      setSelectedImageUrl(null)
    }
  }, [selectedImage])

  return (
    <>
      <Form className='product-details'>
        <div className='product-list-background' />
        {selectedImageUrl || product.image ? (
          <img className='product-details__image' src={selectedImageUrl || product.image} alt={'product'} />
        ) : (
          <img className='product-details__image' src={'/assets/placeholder.jpg'} alt={'product'} />
        )}

        <div className='product-form__content'>
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
        </div>
      </Form>
      <div className='checkout-btn-container'>
        <button className='product__save-btn product__save-btn__enabled' onClick={(e) => handleCreateProduct(e)}>
          {isDeal ? 'Create Deal' : 'Create Product'}
        </button>
      </div>
    </>
  )
}
