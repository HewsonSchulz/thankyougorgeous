export const SubmitButton = ({ text, onClick }) => {
  return (
    <div className='login__submit-btn' onClick={onClick}>
      <img className='login__submit-img' src='/assets/floral1.png' alt='submit button' />
      <p className='gold tang'>{text}</p>
      <div className='spacer'></div>
    </div>
  )
}
