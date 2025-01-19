// URL of the hosted API
export const apiUrl = process.env.REACT_APP_API_URL

// generates options for fetch calls
export const fetchOptions = (
  method,
  body,
  token = JSON.parse(localStorage.getItem('thankyougorgeous_user'))?.token
) => {
  const options = {
    method,
  }

  if (!!token) {
    options.headers = {
      Authorization: `Token ${token}`,
    }
  }

  if (body instanceof FormData) {
    options.body = body
  } else {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    }

    if (!!body) {
      options.body = JSON.stringify(body)
    }
  }

  return options
}

// updates the value of a key within an object stored as React state
export const updateStateObj = (setter, key, value) => {
  setter((prevState) => ({
    ...prevState,
    [key]: value,
  }))
}

// updates the value of a key within an object stored in local storage
export const updateLocalObj = (dataObj, setState = null, storageItem = 'thankyougorgeous_user') => {
  const localObject = JSON.parse(localStorage.getItem(storageItem)) || {}

  for (const key in dataObj) {
    if (dataObj.hasOwnProperty(key)) {
      localObject[key] = dataObj[key]
    }
  }
  localStorage.setItem(storageItem, JSON.stringify(localObject))
  if (!!setState) {
    setState(localObject)
  }
}

// scrolls to top of page
export const scrollToTop = () => {
  window.scrollTo(0, 0)
}

// generates random number from low to high
export const getRandom = (low, high, dec = 0) => {
  return parseFloat((low + Math.random() * (high - low)).toFixed(dec))
}

// converts given number into currency format
export const currency = (n) => {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// truncates given text based on length
export const truncateText = (text, maxLength = 100) => {
  if (text.length > maxLength) {
    return text.substring(0, text.lastIndexOf(' ', maxLength)) + '...'
  }

  return text
}
