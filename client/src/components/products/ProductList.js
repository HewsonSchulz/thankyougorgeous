import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { scrollToTop } from '../../helper'
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
    // trigger refetch when user logs in
    if (loggedInUser) {
      refetch()
    }
  }, [loggedInUser, refetch])

  if (!loggedInUser) {
    return
  }

  if (isLoading) {
    return <div className='loading'>Loading...</div>
  }

  return (
    <div className='products-list'>
      {products?.map((product) => (
        <ul key={product.id} className={'product'}>
          <div>{product.label}</div>
          <div>${product.price}</div>
          <div>{product.description}</div>
        </ul>
      ))}
    </div>
  )
}
