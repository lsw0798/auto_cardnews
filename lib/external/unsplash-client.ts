interface UnsplashPhoto {
  urls?: { regular?: string }
  alt_description?: string
  user?: { name?: string }
}

export async function searchUnsplashImage(
  query: string,
  unsplashKey: string
): Promise<{ url: string; alt: string; credit: string } | null> {
  if (!unsplashKey) return null

  try {
    const url = new URL("https://api.unsplash.com/search/photos")
    url.searchParams.set("query", query)
    url.searchParams.set("per_page", "1")

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${unsplashKey}` },
    })

    if (!response.ok) return null

    const data = (await response.json()) as { results?: UnsplashPhoto[] }
    const first = data.results?.[0]
    if (!first) return null

    return {
      url: first.urls?.regular ?? "",
      alt: first.alt_description ?? query,
      credit: first.user?.name ?? "Unsplash",
    }
  } catch {
    return null
  }
}
