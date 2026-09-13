import { createContext, useContext, useEffect, useState } from 'react'
import { fetchData, loadData } from './storage'

const BrandContext = createContext({ logo: '/logo.svg', refresh: () => {} })

export function BrandProvider({ children }) {
  const [logo, setLogo] = useState(() => loadData().brand?.logo || '/logo.svg')

  async function refresh() {
    const data = await fetchData()
    setLogo(data.brand?.logo || '/logo.svg')
  }

  useEffect(() => {
    refresh()
  }, [])

  return <BrandContext.Provider value={{ logo, refresh }}>{children}</BrandContext.Provider>
}

export function useBrand() {
  return useContext(BrandContext)
}
