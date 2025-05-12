export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) 
    const expirationTime = payload.exp * 1000
    return Date.now() > expirationTime
  } catch (e) {
    return true 
  }
}