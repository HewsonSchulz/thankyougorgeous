import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { currency, removeFromLocalCart, scrollToTop, truncateText } from '../../helper'
import { RemoveFromCartButton } from './RemoveFromCartButton'
import { CheckoutButton } from './CheckoutButton'
import { retrieveProfile } from '../../managers/userManager'

export const Cart = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const getTruncateLength = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    return vw / 4
  }
  const [truncateLength, setTruncateLength] = useState(getTruncateLength())
  const cart = JSON.parse(localStorage.getItem('thankyougorgeous_cart')) || { products: [] }

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['cartProducts'],
    queryFn: () => listProducts([cart.products]),
  })

  const { data: profile, isLoadingProfile } = useQuery({
    queryKey: [`profile${loggedInUser.id}`, loggedInUser.id],
    queryFn: () => retrieveProfile(loggedInUser.id),
    enabled: !!loggedInUser && loggedInUser !== 'loading',
  })

  const calcSubtotal = (products) => {
    let out = 0
    for (const product of products) {
      out += product.price
    }
    return out
  }

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
    return <div className='loading center-txt'>Loading...</div>
  }

  if (!!products && products.length < 1) {
    return <p className='center-txt'>Your cart is currently empty.</p>
  }

  return (
    <>
      <div className='cart__txt'>
        <div>
          <p>Items:</p>
          <p>{currency(calcSubtotal(products))}</p>
        </div>
        <div>
          <p>Shipping:</p>
          <p>{currency(14.99)}</p>
        </div>
        <div className='order-total'>
          <p className='bold-txt'>Order Total:</p>
          <p className='bold-txt'>{currency(calcSubtotal(products) + 14.99)}</p>
        </div>
      </div>
      {/*//TODO <p className='center-txt'>All orders are shipped US priority mail.</p> */}
      <div className='checkout-btn-container'>
        <CheckoutButton
          onClick={() => {
            if (!isLoadingProfile) {
              if (
                (!!profile.venmo || !!profile.cashapp || !!profile.paypal) &&
                !!profile.address &&
                !!profile.phone_num
              ) {
                navigate('/order')
              } else {
                window.alert('Please finish setting up your profile.')
                navigate('/profile')
              }
            }
          }}
        />
      </div>
      <div className='product-list'>
        {products?.map((product) => (
          // <i key={product.id}>
          <>
            <ul
              key={product.id}
              className='product'
              onClick={(e) => {
                e.preventDefault()
                navigate(`/products/${product.id}`)
              }}>
              <img className='product__image' src={product.image || '/assets/placeholder.jpg'} alt={'product'} />

              <div className='product-info'>
                <div className={'product__item product__label'}>
                  {product.quantity}x <i className={`tang-b gold${2 - (product.id % 2)}`}>{product.label}</i>
                </div>
                <div className='product__item product__price'>{currency(product.price)}</div>
                <div className='product__item product__desc'>{truncateText(product.description, truncateLength)}</div>
              </div>
            </ul>
            <RemoveFromCartButton
              onClick={() => {
                if (window.confirm(`Remove ${product.label} from your cart?`)) {
                  removeFromLocalCart(product.id)
                  refetch()
                  window.location.reload()
                }
              }}
            />
          </>
        ))}
      </div>
    </>
  )
}
