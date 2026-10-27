import { useState, useEffect } from 'react'

const API_KEY = 'XRGxrHLvwqw9ObxtaQnfGigXvo6rZBcDRUC6AFQJ'
const COUNT = 30
const AUTHORS = ['Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'Ethan', 'Amelia', 'James', 'Harper', 'Benjamin', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Daniel', 'Avery', 'Matthew', 'Ella', 'David', 'Scarlett']

export function useFetchPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const objectUrls = []

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const requests = Array.from({ length: COUNT }, (_, i) =>
          fetch('https://api.api-ninjas.com/v1/randomimage', {
            headers: {
              'X-Api-Key': API_KEY,
              Accept: 'image/jpg',
            },
          }).then((res) => {
            if (!res.ok) throw new Error('Failed to fetch image')
            return res.blob()
          }).then((blob) => {
            const url = URL.createObjectURL(blob)
            objectUrls.push(url)
            return {
              id: i + 1,
              author: AUTHORS[i],
              download_url: url,
            }
          })
        )
        const data = await Promise.all(requests)
        if (!cancelled) {
          setPhotos(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Something went wrong')
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return { photos, loading, error }
}

