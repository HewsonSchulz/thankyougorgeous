export const CheckoutButton = ({ text = 'Checkout', onClick, disabled = false, message = false }) => {
  return (
    <div
      className='checkout-btn'
      onClick={() => {
        if (!disabled) {
          onClick()
        } else if (!!message) {
          window.alert(message)
        }
      }}>
      {/* <img className='checkout-img' src='/assets/floral1.png' alt='submit button' /> */}
      <p className='gold tang'>{text}</p>
      {/* <div className='spacer'></div> */}
    </div>
  )
}
