import { createContext, useContext, useEffect, useState } from 'react'
import { fetchData, loadData, logoSrc, subscribeData } from './storage'

const BrandContext = createContext({ logo: '/api/logo', refresh: () => {} })

export function BrandProvider({ children }) {
  const [logo, setLogo] = useState(() => logoSrc(loadData().brand?.logo || '/api/logo'))

  async function refresh() {
    const data = await fetchData()
    setLogo(logoSrc(data.brand?.logo || '/api/logo'))
  }

  useEffect(() => {
    const stop = subscribeData((data) => {
      setLogo(logoSrc(data.brand?.logo || '/api/logo'))
    })
    return stop
  }, [])

  useEffect(() => {
    const icon = document.querySelector('link[rel="icon"]')
    const apple = document.querySelector('link[rel="apple-touch-icon"]')
    if (icon) icon.setAttribute('href', logo)
    if (apple) apple.setAttribute('href', logo)
  }, [logo])

  return <BrandContext.Provider value={{ logo, refresh }}>{children}</BrandContext.Provider>
}

export function useBrand() {
  return useContext(BrandContext)
}
