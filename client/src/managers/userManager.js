import { apiUrl, fetchOptions } from '../helper'

export const registerUser = async (user, verCode = null) => {
  const url = verCode ? `${apiUrl}/register?verification_code=${verCode}` : `${apiUrl}/register`

  const res = await fetch(url, fetchOptions('POST', user))
  const data = await res.json()

  return {
    ...data,
    status: res.status,
  }
}
