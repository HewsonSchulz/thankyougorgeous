import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { currency, removeFromLocalCart, scrollToTop, truncateText } from '../../helper'
import { CheckoutButton } from './CheckoutButton'
import { retrieveProfile } from '../../managers/userManager'
import { Order } from './Order'

export const Cart = ({ loggedInUser, isOrder = false }) => {
  const navigate = useNavigate()
  const getTruncateLength = () => {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 10 + 30
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

  const calcSubtotal = (products, shipping = 12.99) => {
    let out = 0
    for (const product of products) {
      out += product.price
    }
    if (out >= 75.0) {
      return out
    }
    return out + shipping
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
  if (isOrder) {
    return (
      <Order
        loggedInUser={loggedInUser}
        itemPrice={calcSubtotal(products, 0)}
        shipping={calcSubtotal(products, 0) < 75 ? currency(12.99) : <p>FREE</p>}
        total={calcSubtotal(products)}
      />
    )
  }

  if (!!products && products.length < 1) {
    return (
      <>
        <div className='cart-background' />
        <p className='center-txt empty-cart-txt'>Your cart is currently empty.</p>
      </>
    )
  }

  return (
    <>
      <div className='cart-background' />
      <div className='cart__txt'>
        <div>
          <p>Items:</p>
          <p>{currency(calcSubtotal(products, 0))}</p>
        </div>
        <div>
          <p>Shipping:</p>
          {calcSubtotal(products, 0) < 75 ? <p>{currency(12.99)}</p> : <p>FREE</p>}
        </div>
        <div className='order-total'>
          <p className='bold-txt'>Order Total:</p>
          <p className='bold-txt'>{currency(calcSubtotal(products))}</p>
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
              onClick={() => {
                if (window.confirm(`Remove ${product.label} from your cart?`)) {
                  removeFromLocalCart(product.id)
                  refetch()
                  window.location.reload()
                }
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
          </>
        ))}
      </div>
    </>
  )
}
