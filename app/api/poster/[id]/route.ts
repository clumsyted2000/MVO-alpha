export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const key = process.env.TMDB_KEY;
  if (!key) return new Response('TMDB_KEY not set', { status: 500 });

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${params.id}?api_key=${key}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return new Response('Not found', { status: 404 });

  const data = await res.json();
  if (!data.poster_path) return new Response('No poster', { status: 404 });

  return Response.redirect(`https://image.tmdb.org/t/p/w500${data.poster_path}`, 307);
}