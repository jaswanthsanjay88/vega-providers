import { Post, ProviderContext } from "../types";

const DB_BASE = "https://db.1flex.org";

export const getPosts = async function ({
  filter,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;

  const url = `${DB_BASE}${filter}${filter.includes("?") ? "&" : "?"}page=${page}`;
  const response = await axios.get(url, {
    signal,
    headers: {
      ...providerContext.commonHeaders,
      Referer: "https://www.1flex.org/",
      Origin: "https://www.1flex.org",
    },
  });

  const results: any[] = response.data?.results || [];
  return results
    .filter((item) => {
      const hasPoster = Boolean(item.poster_path);
      const isReleased = Boolean(item.release_date || item.first_air_date);
      return hasPoster && isReleased;
    })
    .map((item) => {
      const isMovie = Boolean(
        item.title || item.release_date || item.media_type === "movie"
      );
      const mediaType = isMovie ? "movie" : "tv";
      const title = item.title || item.name || "Untitled";
      const image = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "";

      return {
        title,
        link: `https://www.1flex.org/play?id=${item.id}&type=${mediaType}`,
        image,
        tag: mediaType.toUpperCase(),
        cornerTag: item.vote_average
          ? Number(item.vote_average).toFixed(1)
          : undefined,
      };
    });
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  providerValue,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;

  const cleanQuery = searchQuery.trim();
  const url = `${DB_BASE}/search/multi?query=${encodeURIComponent(cleanQuery)}&page=${page}`;
  const response = await axios.get(url, {
    signal,
    headers: {
      ...providerContext.commonHeaders,
      Referer: "https://www.1flex.org/",
      Origin: "https://www.1flex.org",
    },
  });

  const results: any[] = response.data?.results || [];
  return results
    .filter((item) => {
      const type =
        item.media_type || (item.title ? "movie" : item.name ? "tv" : null);
      return type === "movie" || type === "tv";
    })
    .map((item) => {
      const isMovie =
        item.media_type === "movie" || Boolean(item.title && !item.name);
      const mediaType = isMovie ? "movie" : "tv";
      const title = item.title || item.name || "Untitled";
      const image = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "";

      return {
        title,
        link: `https://www.1flex.org/play?id=${item.id}&type=${mediaType}`,
        image,
        tag: mediaType.toUpperCase(),
        cornerTag: item.vote_average
          ? Number(item.vote_average).toFixed(1)
          : undefined,
      };
    });
};
