import { apiUrl, fetchOptions } from '../helper'

export const createOrder = async (cart) => {
  return await fetch(`${apiUrl}/orders`, fetchOptions('POST', cart)).then((res) => res.json())
}
