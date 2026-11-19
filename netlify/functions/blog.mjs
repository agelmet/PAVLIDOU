// Reads Zenia's Blogger feed on the server, so the visitor's browser only talks to her own site (GDPR).
const FEED = 'https://neurographicaingreecebyzp.blogspot.com/feeds/posts/default?alt=json&max-results=12';
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export default async () => {
  try {
    const j = await fetch(FEED).then(r => r.json());
    const posts = (j.feed.entry || []).map(e => {
      const d = new Date(e.published.$t);
      const text = strip(e.content ? e.content.$t : (e.summary ? e.summary.$t : ''));
      return { title: strip(e.title.$t).replace(/^[^\p{L}\p{N}]+/u, ''), url: (e.link.find(l => l.rel === 'alternate') || {}).href,
               date: d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' }), excerpt: text.length > 170 ? text.slice(0, 167).replace(/\s\S*$/, '') + '…' : text };
    });
    return new Response(JSON.stringify({ posts }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch (e) { return new Response(JSON.stringify({ posts: [] }), { status: 200, headers: { 'content-type': 'application/json' } }); }
};
export const config = { path: '/api/blog' };
