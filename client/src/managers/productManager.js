import { apiUrl, fetchOptions } from '../helper'

export const retrieveProduct = async (pk) => {
  return await fetch(`${apiUrl}/products/${pk}`, fetchOptions('GET')).then((res) => res.json())
}

export const listProducts = async () => {
  return await fetch(`${apiUrl}/products`, fetchOptions('GET')).then((res) => res.json())
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
