/**
 * Service worker — chỉ lưu tạm phần "vỏ" giao diện (trang, biểu tượng) để mở app nhanh
 * và vẫn mở được khi mạng chập chờn. KHÔNG lưu dữ liệu công việc: dữ liệu luôn lấy mới
 * từ Apps Script để tránh hiển thị số liệu cũ gây hiểu nhầm.
 *
 * Mỗi khi sửa index.html, hãy tăng số phiên bản PHIEN_BAN bên dưới (v1 -> v2 -> ...)
 * để điện thoại nhận bản mới thay vì dùng bản cũ đã lưu.
 */
const PHIEN_BAN = 'ttdh-v4';
const VO_GIAO_DIEN = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(PHIEN_BAN)
      .then((c) => c.addAll(VO_GIAO_DIEN))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((ds) => Promise.all(ds.filter((d) => d !== PHIEN_BAN).map((d) => caches.delete(d))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const url = ev.request.url;
  // Dữ liệu từ Apps Script: luôn lấy mới qua mạng, không bao giờ lấy từ bộ nhớ tạm
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('googleusercontent.com') !== -1) return;
  if (ev.request.method !== 'GET') return;

  ev.respondWith(
    caches.match(ev.request).then((daLuu) => {
      if (daLuu) return daLuu;
      return fetch(ev.request).catch(() => caches.match('./index.html'));
    })
  );
});
