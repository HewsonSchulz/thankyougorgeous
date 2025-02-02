import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../../managers/productManager'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { currency, scrollToTop, truncateText } from '../../helper'
import './ProductList.css'

const calculateMatches = (text, searchTerm) => {
  if (!text) return 0
  const regex = new RegExp(searchTerm, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

export const ProductList = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  const getTruncateLength = () => {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 10 + 30
  }
  const [truncateLength, setTruncateLength] = useState(getTruncateLength())

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  })

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
    refetch()
  }, [loggedInUser, refetch])

  useEffect(() => {
    if (!products) return

    if (searchTerm === '') {
      setFilteredProducts(products)
    } else {
      const searchTermLower = searchTerm.toLowerCase().trim()

      // create scored version of products
      const scoredProducts = products.map((product) => {
        // title matches - 3 points
        const titleScore = calculateMatches(product.label?.toLowerCase(), searchTermLower) * 3

        // description matches - 1 point
        const descriptionScore = calculateMatches(product.description?.toLowerCase(), searchTermLower)

        // total
        const totalScore = titleScore + descriptionScore

        return {
          ...product,
          searchScore: totalScore,
        }
      })

      // filter matching products and sort by score
      const filteredAndSorted = scoredProducts
        .filter((product) => product.searchScore > 0)
        .sort((a, b) => {
          // sort by search score
          const scoreDiff = b.searchScore - a.searchScore
          if (scoreDiff !== 0) return scoreDiff

          // if scores are equal, sort by label
          return a.label.localeCompare(b.label)
        })

      setFilteredProducts(filteredAndSorted)
    }
  }, [products, searchTerm])

  if (isLoading) {
    return <div className='loading'>Loading...</div>
  }

  return (
    <>
      <div className='product-list-background' />

      {/* search bar */}
      <div className='search-container'>
        <input
          type='text'
          placeholder='Search...'
          className='search-input'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {!!loggedInUser && loggedInUser !== 'loading' && loggedInUser.is_admin && (
        <div className='create-product-btn-container'>
          <button className='create-product-btn' onClick={() => navigate('/newproduct')}>
            Create New Product
          </button>
        </div>
      )}

      <div className='product-list'>
        {searchTerm && filteredProducts.length === 0 ? (
          <div className='no-results'>No results found for "{searchTerm}"</div>
        ) : (
          filteredProducts?.map((product) => (
            <ul
              key={product.id}
              className='product'
              onClick={(e) => {
                e.preventDefault()
                navigate(`/products/${product.id}`)
              }}>
              <img className='product__image' src={product.image || '/assets/placeholder.jpg'} alt={'product'} />
              <div className='product-info'>
                <div className={`product__item product__label tang-b gold${2 - (product.id % 2)}`}>{product.label}</div>
                <div className='product__item product__price'>{currency(product.price)}</div>
                <div className='product__item product__desc'>{truncateText(product.description, truncateLength)}</div>
              </div>
            </ul>
          ))
        )}
      </div>
    </>
  )
}
