import { useCallback, useEffect, useRef, useState } from 'react'

// Loads data from the API and tracks loading / error state.
//   const { data, setData, loading, error, reload } = useAsync(() => wishlistApi.mine(), [])
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const alive = useRef(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps)

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const data = await run()
      if (alive.current) setState({ data, loading: false, error: '' })
      return data
    } catch (err) {
      if (alive.current) setState({ data: null, loading: false, error: err.message, status: err.status })
      return null
    }
  }, [run])

  useEffect(() => {
    alive.current = true
    reload()
    return () => {
      alive.current = false
    }
  }, [reload])

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  }, [])

  return { ...state, setData, reload }
}
