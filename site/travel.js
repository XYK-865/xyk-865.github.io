const travelAlbums = [
  { slug: 'hengshan-north', name: '北岳恒山', province: '山西', day: '10.1', count: 16, omit: [11], cover: '02.jpg' },
  { slug: 'taishan', name: '东岳泰山', province: '山东', day: '10.2', count: 19, omit: [7], cover: '03.jpg' },
  { slug: 'songshan', name: '中岳嵩山', province: '河南', day: '10.4', count: 19, omit: [5, 7, 17], cover: '12.jpg' },
  { slug: 'huashan', name: '西岳华山', province: '陕西', day: '10.5', count: 17, omit: [8], cover: '04.jpg' },
  { slug: 'hengshan-south', name: '南岳衡山', province: '湖南', day: '10.7', count: 13, cover: '07.jpg' }
];

const visibleCount = album => album.count - (album.omit?.length || 0);

// Keep links to the old single-page gallery usable.
if (document.querySelector('.travel-page') && location.hash) {
  const slug = decodeURIComponent(location.hash.slice(1));
  if (travelAlbums.some(album => album.slug === slug)) {
    location.replace(`travel-album.html?album=${slug}`);
  }
}

const cardRoot = document.getElementById('travel-album-cards');
if (cardRoot) {
  for (const [index, album] of travelAlbums.entries()) {
    const card = document.createElement('a');
    card.className = 'travel-album-card';
    card.href = `travel-album.html?album=${album.slug}`;
    card.setAttribute('aria-label', `打开${album.name}相册，${visibleCount(album)}张照片`);
    const cover = document.createElement('img');
    cover.src = `assets/travel/${album.slug}/${album.cover}`;
    cover.alt = `${album.name}的旅行风景`;
    cover.loading = index < 2 ? 'eager' : 'lazy';
    const label = document.createElement('span');
    label.className = 'travel-album-card-content';
    label.innerHTML = `<small>${album.day} / ${album.province}</small><strong>${album.name}</strong><span>${visibleCount(album)} 张照片 · 查看相册 ↗</span>`;
    card.append(cover, label);
    cardRoot.append(card);
  }
}

const gallery = document.getElementById('travel-album-gallery');
if (gallery) {
  const slug = new URLSearchParams(location.search).get('album');
  const album = travelAlbums.find(item => item.slug === slug);
  const title = document.getElementById('travel-album-title');
  const current = document.getElementById('travel-current-album');
  const meta = document.getElementById('travel-album-meta');
  if (!album) {
    title.textContent = '相册未找到';
    meta.textContent = '请返回 2026 合集选择相册。';
  } else {
    document.title = `${album.name} · 2026 旅行相册 · Spike Hsu`;
    title.textContent = current.textContent = album.name;
    meta.textContent = `${album.province} · ${visibleCount(album)} 张照片`;
    let photoNumber = 0;
    for (let index = 1; index <= album.count; index++) {
      if (album.omit?.includes(index)) continue;
      photoNumber++;
      const url = `assets/travel/${album.slug}/${String(index).padStart(2, '0')}.jpg`;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `查看${album.name}第 ${photoNumber} 张照片原图`);
      const photo = document.createElement('img');
      photo.src = url;
      photo.alt = `${album.name}旅行照片 ${photoNumber}`;
      photo.loading = photoNumber <= 3 ? 'eager' : 'lazy';
      photo.decoding = 'async';
      link.append(photo);
      gallery.append(link);
    }
  }
}
