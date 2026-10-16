const travelAlbums = [
  { slug: 'hengshan-north', name: '北岳恒山', province: '山西', count: 16 },
  { slug: 'taishan', name: '东岳泰山', province: '山东', count: 19 },
  { slug: 'songshan', name: '中岳嵩山', province: '河南', count: 19 },
  { slug: 'huashan', name: '西岳华山', province: '陕西', count: 17 },
  { slug: 'hengshan-south', name: '南岳衡山', province: '湖南', count: 13 }
];

const albumRoot = document.getElementById('travel-albums');
for (const album of travelAlbums) {
  const section = document.createElement('section');
  section.className = 'travel-album';
  section.id = album.slug;
  const heading = document.createElement('div');
  heading.className = 'travel-album-heading';
  heading.innerHTML = `<div><p class="kicker">${album.province} / ${String(album.count).padStart(2, '0')} PHOTOS</p><h2>${album.name}</h2></div><a href="#main" aria-label="返回页面顶部">↑ 返回顶部</a>`;
  const gallery = document.createElement('div');
  gallery.className = 'travel-gallery';
  for (let index = 1; index <= album.count; index++) {
    const url = `assets/travel/${album.slug}/${String(index).padStart(2, '0')}.jpg`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `查看${album.name}第 ${index} 张照片原图`);
    const photo = document.createElement('img');
    photo.src = url;
    photo.alt = `${album.name}旅行照片 ${index}`;
    photo.loading = index <= 3 && album === travelAlbums[0] ? 'eager' : 'lazy';
    photo.decoding = 'async';
    link.append(photo);
    gallery.append(link);
  }
  section.append(heading, gallery);
  albumRoot.append(section);
}
