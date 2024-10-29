import { apiUrl, fetchOptions } from '../helper'

export const registerUser = async (user, ver_code = null) => {
  if (!!ver_code) {
    return await fetch(`${apiUrl}/register?verification_code=${ver_code}`, fetchOptions('POST', user)).then((res) =>
      res.json()
    )
  }
  return await fetch(`${apiUrl}/register`, fetchOptions('POST', user)).then((res) => res.json())
}
