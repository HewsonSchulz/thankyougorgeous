import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { currency, scrollToTop, truncateText } from '../../helper'
import './ProductList.css'

export const ProductList = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const getTruncateLength = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    return vw / 4
  }
  const [truncateLength, setTruncateLength] = useState(getTruncateLength())

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  })

  useEffect(() => {
    const handleResize = () => {
      setTruncateLength(getTruncateLength())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <>
      {!!loggedInUser && loggedInUser !== 'loading' && loggedInUser.is_admin && (
        <button className='create-product-btn' onClick={() => navigate('/newproduct')}>
          Add Product
        </button>
      )}

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
            {/*//TODO! <div>{product.image}</div> */}
            <div className='product-info'>
              <div className={`product__item product__label tang-b gold${2 - (product.id % 2)}`}>{product.label}</div>
              <div className='product__item product__price'>{currency(product.price)}</div>
              <div className='product__item product__desc'>{truncateText(product.description, truncateLength)}</div>
            </div>
          </ul>
        ))}
      </div>
    </>
  )
}
