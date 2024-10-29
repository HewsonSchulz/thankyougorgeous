// URL of the hosted API
export const apiUrl = process.env.REACT_APP_API_URL

// generates options for fetch calls
export const fetchOptions = (method, body) => {
  const token = JSON.parse(localStorage.getItem('turtle_user'))?.token

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

// scroll to top of page
export const scrollToTop = () => {
  window.scrollTo(0, 0)
}
