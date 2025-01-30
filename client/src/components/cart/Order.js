import { Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../../managers/orderManager'
import { CheckoutButton } from './CheckoutButton'
import { useEffect, useState } from 'react'

export const Order = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const cart = JSON.parse(localStorage.getItem('thankyougorgeous_cart')) || { products: [] }
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (!!loggedInUser && loggedInUser !== 'loading') {
      if (
        (!loggedInUser.venmo && !loggedInUser.cashapp && !loggedInUser.paypal) ||
        !loggedInUser.address ||
        !loggedInUser.phone_num
      ) {
        navigate('/cart')
      }
    }
  }, [loggedInUser, navigate])

  if (cart.products.length < 1) {
    return <Navigate to='/cart' />
  }

  return (
    <>
      [VENMO, CASHAPP, PAYPAL QR CODES HERE]
      <div className='place-order-btn checkout-btn-container'>
        <CheckoutButton
          text='Place Order'
          onClick={() => {
            setIsDisabled(true)
            createOrder(cart).then((createdOrder) => {
              if (createdOrder.valid) {
                localStorage.setItem('thankyougorgeous_cart', JSON.stringify({ products: [] }))
                window.alert('Your order has been placed.')
                navigate('/')
              } else {
                window.alert(createdOrder.message || createdOrder.error)
                navigate('/profile')
              }
            })
          }}
          disabled={isDisabled}
        />
      </div>
    </>
  )
}
