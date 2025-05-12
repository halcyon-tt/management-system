const TOKENKEY = 'token_key'

function setToken(token) {
  sessionStorage.setItem(TOKENKEY, token)
}

function getToken() {
  return sessionStorage.getItem(TOKENKEY)
}

function removeToken() {
  sessionStorage.removeItem(TOKENKEY)
}

export { setToken, getToken, removeToken }