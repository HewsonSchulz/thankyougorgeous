export const RemoveFromCartButton = ({ text = 'Delete', onClick }) => {
  return (
    <div className='trash-btn' onClick={onClick}>
      <img className='trash-btn__img' src='/assets/iconTrash.png' alt='remove from cart button' />
      <p>{text}</p>
      <div className='spacer'></div>
    </div>
  )
}
