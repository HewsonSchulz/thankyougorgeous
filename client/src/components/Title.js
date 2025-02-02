import { Link } from 'react-router-dom'

export const Title = () => {
  return (
    <Link to='/' className='title-link'>
      <div className='title tang-b gold2'>Thank you Gorgeous Boutique</div>
      <div className='subtitle'>BOUGIE ON A BUDGET</div>
    </Link>
  )
}

export const TitleBackdrop = () => {
  return (
    <>
      <div className='title-img' />
      <div className='title-img2-container'>
        <div className='title-img2' />
        <Link to='/products' className='title-img3' />
      </div>
    </>
  )
}
