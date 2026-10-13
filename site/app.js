const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');

document.querySelectorAll('.photo').forEach((photo) => {
  photo.addEventListener('click', () => {
    lightboxImage.src = photo.dataset.full;
    lightboxImage.alt = photo.querySelector('img').alt;
    lightboxCaption.textContent = photo.dataset.caption;
    lightbox.showModal();
  });
});

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.querySelector('#year').textContent = new Date().getFullYear();
