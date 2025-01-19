import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { currency, scrollToTop } from '../../helper'
import './ProductList.css'

export const ProductList = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
    enabled: false, // disable automatic fetching
  })

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
    <div className='product-list'>
      {products?.map((product) => (
        <ul
          key={product.id}
          className='product'
          onClick={(e) => {
            e.preventDefault()
            navigate(`/products/${product.id}`)
          }}>
          <img className='product__image' src={`/assets/placeholder.jpg`} alt={'product'} />
          {/*//TODO <div>{product.image}</div> */}
          <div className='product-info'>
            <div className={`product__item product__label tang-b gold${2 - (product.id % 2)}`}>{product.label}</div>
            <div className='product__item product__price'>{currency(product.price)}</div>
            {/* <div className='product__item product__quantity'>{product.quantity}</div> */}
            <div className='product__item product__desc'>{product.description}</div>
          </div>
        </ul>
      ))}
    </div>
  )
}
