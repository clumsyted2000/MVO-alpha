import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const imdbId = req.nextUrl.searchParams.get('imdbId');
  if (!imdbId) return Response.json({ error: 'imdbId required' }, { status: 400 });

  const key = process.env.OMDB_KEY;
  if (!key) return Response.json({ error: 'OMDB_KEY not set' }, { status: 500 });

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();

    const rt = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    return Response.json({
      imdb: data.imdbRating && data.imdbRating !== 'N/A' ? Number(data.imdbRating) : null,
      rt: rt ? Number(rt.Value.replace('%', '')) : null,
    });
  } catch {
    return Response.json({ error: 'fetch failed' }, { status: 502 });
  }
}