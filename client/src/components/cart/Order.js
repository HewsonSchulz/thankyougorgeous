import { Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../../managers/orderManager'
import { CheckoutButton } from './CheckoutButton'

export const Order = () => {
  const navigate = useNavigate()
  const cart = JSON.parse(localStorage.getItem('thankyougorgeous_cart')) || { products: [] }

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
            createOrder(cart).then(() => {
              localStorage.setItem('thankyougorgeous_cart', JSON.stringify({ products: [] }))
              window.alert('Your order has been placed.')
              navigate('/')
            })
          }}
        />
      </div>
    </>
  )
}
