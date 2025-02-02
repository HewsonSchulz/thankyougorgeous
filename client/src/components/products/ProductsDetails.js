import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { retrieveProduct } from '../../managers/productManager'
import { useEffect } from 'react'
import { currency, scrollToTop, updateLocalCart } from '../../helper'
import './ProductDetails.css'
import { AddToCartButton } from './AddToCartButton'

export const ProductDetails = ({ loggedInUser }) => {
  const { productId } = useParams()
  const navigate = useNavigate()

  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => retrieveProduct(productId),
    enabled: !!productId,
  })

  const addToCart = (product) => {
    if (window.confirm(`Add ${product.label} to your cart?`)) updateLocalCart([product.id])
  }

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    // trigger refetch when user logs in/out
    refetch()
  }, [loggedInUser, refetch])

  if (isLoading) {
    return <div className='loading'>Loading...</div>
  }

  if (!!product.error || !!product.message) {
    return <Navigate to='/' replace />
  }

  return (
    <>
      <ul key={product.id} className='product-details'>
        <div className='product-list-background' />
        <img className='product-details__image' src={product.image || '/assets/placeholder.jpg'} alt={'product'} />

        <div className='product-details__content'>
          <div className='product-details-info'>
            <div className={`product-details__item product-details__label tang-b gold${2 - (product.id % 2)}`}>
              {product.label}
            </div>
            <div className='product-details__item product-details__price'>{currency(product.price)}</div>
          </div>
          {product.quantity > 0 ? (
            <>
              <div className='product-details__item product-details__quantity'>{product.quantity} left in stock</div>
              <AddToCartButton onClick={() => addToCart(product)} />
            </>
          ) : (
            <>
              <div className='product-details__item product-details__quantity'>OUT OF STOCK</div>
              <AddToCartButton onClick={() => window.alert(`${product.label} is currently out of stock.`)} />
            </>
          )}
          <div className='product-details__item product-details__desc'>{product.description}</div>
        </div>
      </ul>
      {!!loggedInUser && loggedInUser !== 'loading' && loggedInUser.is_admin && (
        <div className='checkout-btn-container'>
          <button className='edit-product-btn' onClick={() => navigate(`/products/edit/${productId}`)}>
            Edit Product
          </button>
        </div>
      )}
    </>
  )
}
