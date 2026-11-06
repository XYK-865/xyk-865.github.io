export const types = {
  group: ['groups', '集团'],
  brand: ['brands', '品牌'],
  series: ['series', '系列'],
  product: ['products', '单品'],
};

export const statuses = {
  classic: '品牌经典',
  featured: '官方主推',
  popular: '市场热门',
  new: '新品上市',
};

export const detailUrl = (type, id) =>
  'cosmetic-detail.html?' + new URLSearchParams({ type, id });

let pending;

export function loadCatalog() {
  pending ??= fetch(new URL('cosmetic-catalog.json', import.meta.url))
    .then(response => {
      if (!response.ok) throw new Error('Catalogue unavailable');
      return response.json();
    })
    .then(data => {
      if (!Object.values(types).every(([key]) => Array.isArray(data[key]))) {
        throw new Error('Invalid catalogue');
      }
      return data;
    })
    .catch(error => {
      pending = undefined;
      throw error;
    });
  return pending;
}

export function catalogRecords(data) {
  const records = {};
  for (const [type, [key]] of Object.entries(types)) {
    records[type] = new Map(data[key].map(item => [
      item.id, { type, item, children: [], products: [], evidence: [] },
    ]));
  }
  for (const record of records.brand.values()) record.parent = records.group.get(record.item.groupId);
  for (const record of records.series.values()) record.parent = records.brand.get(record.item.brandId);
  for (const record of records.product.values()) record.parent = records.series.get(record.item.seriesId);
  const all = Object.values(records).flatMap(map => [...map.values()]);
  for (const record of all) {
    const path = [record];
    for (let node = record.parent; node; node = node.parent) path.unshift(node);
    record.path = path;
    record.group = path.find(node => node.type === 'group')?.item;
    record.brand = path.find(node => node.type === 'brand')?.item;
    record.parent?.children.push(record);
    if (record.type === 'product') {
      for (const node of path) node.products.push(record);
      record.evidence = (data.evidence ?? []).filter(entry =>
        entry.productId === record.item.id && Object.hasOwn(statuses, entry.tag) &&
        entry.status === 'verified' && /^https:\/\//i.test(entry.url ?? '') &&
        /^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? ''));
    }
  }
  return { all, records };
}

export function searchText(record) {
  const { item, path } = record;
  return [
    ...path.flatMap(({ item: node }) => [node.name, node.nameEn, ...(node.aliases ?? [])]),
    record.group?.country, record.brand?.positioning, item.category, item.description,
    ...(item.benefits ?? []), ...(item.ingredients ?? []), ...(item.functionTags ?? []),
  ].filter(Boolean).join(' ');
}

export async function catalogSearchEntries() {
  const { all } = catalogRecords(await loadCatalog());
  const pages = [
    { title: 'Cosmetic · 化妆品发展史', description: '化妆品专题', href: 'cosmetic.html' },
    { title: '全球化妆品图鉴', description: '集团、品牌、系列与单品', href: 'cosmetic-brands.html' },
  ];
  return pages.concat(all.map(record => ({
    title: record.item.name,
    description: '化妆品图鉴 · ' + types[record.type][1],
    href: detailUrl(record.type, record.item.id),
    summary: searchText(record),
  })));
}
