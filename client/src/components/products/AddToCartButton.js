export const AddToCartButton = ({ text = 'Add to Cart', onClick }) => {
  return (
    <div className='cart-btn login__submit-btn' onClick={onClick}>
      <img className='cart-btn__img login__submit-img' src='/assets/cart.png' alt='add to cart button' />
      <p className='gold tang'>{text}</p>
      <div className='spacer'></div>
    </div>
  )
}
