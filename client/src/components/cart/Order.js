import { Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../../managers/orderManager'
import { CheckoutButton } from './CheckoutButton'
import { useEffect, useState } from 'react'
import { currency } from '../../helper'
import { Input } from 'reactstrap'

export const Order = ({ loggedInUser, itemPrice, shipping, total }) => {
  const navigate = useNavigate()
  const cart = JSON.parse(localStorage.getItem('thankyougorgeous_cart')) || { products: [] }
  const [isDisabled, setIsDisabled] = useState(false)
  const [paymentSent, setPaymentSent] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')

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
      <div className='cart-background order-background' />
      <div className='order__content'>
        <div>
          <div className='order__qr order__qr1' />
          <p>Venmo - @dawn_perrone</p>
        </div>
        <div>
          <div className='order__qr order__qr2' />
          <p>PayPal - Dawn Perrone</p>
        </div>
        <div>
          <div className='order__qr order__qr3' />
          <p>Cashapp - $dawnmperrone7103</p>
        </div>
      </div>

      <div className='order__p'>
        <p>
          Please select a payment method, and send your order total of {currency(total)}. Once you have sent your
          payment, press "Place Order" to complete your purchase.
        </p>
        <div className='payment-method-container'>
          {!!loggedInUser.venmo && (
            <p2>
              <Input
                type='radio'
                name='payment-method'
                className='w-4 h-4'
                value='venmo'
                checked={selectedPaymentMethod === 'venmo'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <span>Venmo</span>
            </p2>
          )}
          {!!loggedInUser.paypal && (
            <p2>
              <Input
                type='radio'
                name='payment-method'
                className='w-4 h-4'
                value='paypal'
                checked={selectedPaymentMethod === 'paypal'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <span>PayPal</span>
            </p2>
          )}
          {!!loggedInUser.cashapp && (
            <p2>
              <Input
                type='radio'
                name='payment-method'
                className='w-4 h-4'
                value='cashapp'
                checked={selectedPaymentMethod === 'cashapp'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <span>Cashapp</span>
            </p2>
          )}
        </div>
        <p className='payment-checkbox'>
          <Input
            type='checkbox'
            checked={paymentSent}
            onChange={(e) => setPaymentSent(e.target.checked)}
            className='w-4 h-4'
          />
          <span>I have sent my payment.</span>
        </p>
      </div>

      <div className='order'>
        <div className='place-order-btn checkout-btn-container'>
          <CheckoutButton
            text='Place Order'
            message='Please confirm that you have sent payment before placing your order.'
            onClick={() => {
              if (!isDisabled) {
                if (!selectedPaymentMethod) {
                  window.alert('Please select a payment method before placing your order.')
                } else if (!paymentSent) {
                  window.alert('Please confirm that you have sent payment before placing your order.')
                } else {
                  setIsDisabled(true)
                  createOrder({ ...cart, payment_method: selectedPaymentMethod }).then((createdOrder) => {
                    if (createdOrder.valid) {
                      localStorage.setItem('thankyougorgeous_cart', JSON.stringify({ products: [] }))
                      window.alert('Your order has been placed.')
                      navigate('/')
                    } else {
                      window.alert(createdOrder.message || createdOrder.error)
                      navigate('/profile')
                    }
                  })
                }
              }
            }}
            disabled={false}
          />
        </div>
      </div>
    </>
  )
}
