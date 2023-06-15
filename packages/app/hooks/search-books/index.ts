import type { Dispatch, SetStateAction } from 'react'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useState } from 'react'
import { useBooksApi } from '../../provider'

interface VolumeInfoBaseImages {
  smallThumbnail: string
  thumbnail: string
}

interface VolumeInfoImages extends VolumeInfoBaseImages {
  altSm: string
  altMd: string
  altLg: string
}

interface VolumeInfo {
  id: string
  title: string
  subtitle: string
  authors: Array<string>
  publisher: string
  publishedDate: string
  description: string
  industryIdentifiers: Array<{
    type: string
    identifier: string
  }>
  categories: Array<string>
  maturityRating: string
  imageLinks: VolumeInfoImages
  language: string
}

interface SearchResultGoogleBookApi {
  kind: string
  totalItems: number
  items: Array<VolumeInfo>
  next?: number
}

export function useSearchBooks(): {
  inputSearchValue: string
  setInputSearchValue: Dispatch<SetStateAction<string>>
  querySearchBooks: UseInfiniteQueryResult<SearchResultGoogleBookApi, unknown>
  query: string
} {
  const apiKeyGoogleBooks = useBooksApi((s) => s.googleBooksApiAccessToken)
  const [inputSearchValue, setInputSearchValue] = useState('')
  const [query] = useDebounce(inputSearchValue, 800)

  async function fetchBooks({ pageParam = 0 }): Promise<SearchResultGoogleBookApi> {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&startIndex=${pageParam}&key=${apiKeyGoogleBooks}`
    )
    const results = await response.json()
    const items = results?.items?.map((volume, i) => {
      if (volume?.volumeInfo?.industryIdentifiers) {
        return {
          ...volume?.volumeInfo,
          imageLinks: {
            ...volume?.volumeInfo?.imageLinks,
            altSm: `https://covers.openlibrary.org/b/isbn/${volume?.volumeInfo?.industryIdentifiers[0]?.identifier}-S.jpg`,
            altMd: `https://covers.openlibrary.org/b/isbn/${volume?.volumeInfo?.industryIdentifiers[0]?.identifier}-M.jpg`,
            altLg: `https://covers.openlibrary.org/b/isbn/${volume?.volumeInfo?.industryIdentifiers[0]?.identifier}-L.jpg`,
          },
        }
      }
      return {
        ...volume?.volumeInfo,
        imageLinks: {
          ...volume?.volumeInfo?.imageLinks,
        },
      }
    })

    const select = {
      ...results,
      items,
      next: pageParam + 20 < results.totalItems ? pageParam + 20 : undefined,
    }
    return select
  }

  const querySearchBooks = useInfiniteQuery({
    queryKey: ['search-books', query],
    enabled: query.trim().length > 2,
    queryFn: fetchBooks,
    getNextPageParam: (lastPage) => lastPage.next,
  })

  return {
    querySearchBooks,
    query,
    setInputSearchValue,
    inputSearchValue,
  }
}

export default useSearchBooks
