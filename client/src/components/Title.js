import { Link } from 'react-router-dom'

export const Title = () => {
  return (
    <Link to='/' className='title-link'>
      <div className='title tang-b gold2'>My Blessed Gemz Boutique</div>
      {/* <div className='subtitle'>BOUGIE ON A BUDGET</div> */}
    </Link>
  )
}

export const TitleBackdrop = () => {
  return <Link to='/products' className='title-img' />
}
