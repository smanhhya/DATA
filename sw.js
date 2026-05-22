self.addEventListener('install', (e) => {
    console.log('[Service Worker] تم التثبيت');
});

self.addEventListener('fetch', (e) => {
    // لن نقوم بتخزين معقد الآن، فقط ليعمل كـ PWA
});
