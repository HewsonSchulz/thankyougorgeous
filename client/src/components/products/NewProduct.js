import { useNavigate } from 'react-router-dom'
import { Form, FormGroup, Input } from 'reactstrap'
import { useState } from 'react'
import { updateStateObj } from '../../helper'
import { createProduct } from '../../managers/productManager'

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

export const NewProduct = ({ loggedInUser, setLoggedInUser }) => {
  const [product, setProduct] = useState({ label: '', price: '', description: '', quantity: '' })
  const navigate = useNavigate()

  const handleCreateProduct = (e) => {
    e.preventDefault()

    product.price = Number(product.price)
    product.quantity = Number(product.quantity)

    if (product.price < 0.01) {
      window.alert('Please enter a valid price.')
    } else {
      createProduct(product).then((createdProduct) => {
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
    }
  }

  return (
    <Form className='product-form'>
      {FormItem(product, setProduct, 'label', 'Title')}
      {FormItem(product, setProduct, 'price', 'Price', 'number')}
      {FormItem(product, setProduct, 'description', 'Description', 'textarea')}
      {FormItem(product, setProduct, 'quantity', 'Quantity', 'number')}

      <button className='profile__save-btn profile__save-btn__enabled' onClick={(e) => handleCreateProduct(e)}>
        Create Product
      </button>
    </Form>
  )
}
