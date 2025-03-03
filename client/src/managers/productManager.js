import { apiUrl, fetchOptions } from '../helper'

export const retrieveProduct = async (pk) => {
  return await fetch(`${apiUrl}/products/${pk}`, fetchOptions('GET')).then((res) => res.json())
}

export const listProducts = async (products = []) => {
  if (products.length > 0) {
    return await fetch(`${apiUrl}/products?products=[${products}]`, fetchOptions('GET')).then((res) => res.json())
  }
  return await fetch(`${apiUrl}/products`, fetchOptions('GET')).then((res) => res.json())
}

export const listDeals = async () => {
  return await fetch(`${apiUrl}/products/deals`, fetchOptions('GET')).then((res) => res.json())
}

export const createProduct = async (product) => {
  return await fetch(`${apiUrl}/products`, fetchOptions('POST', product)).then((res) => res.json())
}

export const updateProduct = async (product, pk) => {
  return await fetch(`${apiUrl}/products/${pk}`, fetchOptions('PUT', product)).then((res) => res.json())
}

export const destroyProduct = async (pk) => {
  return await fetch(`${apiUrl}/products/${pk}`, fetchOptions('DELETE'))
}
