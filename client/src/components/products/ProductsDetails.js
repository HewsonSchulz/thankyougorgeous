import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { retrieveProduct } from '../../managers/productManager'
import { useEffect } from 'react'
import { currency, scrollToTop, updateLocalCart } from '../../helper'
import './ProductDetails.css'
import { AddToCartButton } from './AddToCartButton'

export const ProductDetails = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const { productId } = useParams()

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

  return (
    <ul key={product.id} className='product-details'>
      <img className='product-details__image' src={`/assets/placeholder.jpg`} alt={'product'} />
      {/*//TODO <div>{product.image}</div> */}
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
    </ul>
  )
}
