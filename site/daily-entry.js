if (location.hash === '#coffee-records') {
  const target = new URL('coffee.html', location.href);
  target.search = location.search;
  target.hash = 'coffee-records';
  location.replace(target);
}
