var CACHE_NAME = 'my-site-cache';

var urlsToPrefetch = [
      '/index.html',
      '/project1/add2numbers.html',
      '/images/3kali4.jpg',
      '/images/menu.png',
      '/project1/add2numbers.js',
      '/project2/mapbox.html',
      '/project3/kuliner.html',
      '/project3/css/peta.css',
      '/project3/data/peta.json',
      '/project3/images/ikan_bakar.jpg',
      '/project3/images/planB.jpg',
      '/project3/images/seafood.jpg',
      '/project3/images/steak.jpg',
      '/project3/images/warkop.jpg',
      '/project3/js/peta.js'
  
  
  
];



self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // Magic is here. Look the  mode: 'no-cors' part.
        cache.addAll(urlsToPrefetch.map(function(urlToPrefetch) {
           return new Request(urlToPrefetch, { mode: 'no-cors' });
        })).then(function() {
          console.log('All resources have been fetched and cached.');
        });
      })
  );
});





self.addEventListener('fetch', function(event) {
 console.log(event.request.url);
 var tryInCachesFirst = caches.open(CACHE_NAME).then(cache => {
    return cache.match(event.request).then(response => {
      if (!response) {
        return handleNoCacheMatch(event);
      }
      // Update cache record in the background
      fetchFromNetworkAndCache(event);
      // Reply with stale data
      return response
    });
  });
  
  
 event.respondWith(
   caches.match(event.request).then(function(response) {
     return response || fetch(event.request);
   })
 );
});

function fetchFromNetworkAndCache(event) {
  // DevTools opening will trigger these o-i-c requests, which this SW can't handle.
  // There's probaly more going on here, but I'd rather just ignore this problem. :)
  // https://github.com/paulirish/caltrainschedule.io/issues/49
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

  return fetch(event.request).then(res => {
    // foreign requests may be res.type === 'opaque' and missing a url
    if (!res.url) return res;
    // regardless, we don't want to cache other origin's assets
    if (new URL(res.url).origin !== location.origin) return res;

    return caches.open(CACHE_NAME).then(cache => {
      // TODO: figure out if the content is new and therefore the page needs a reload.
      cache.put(event.request, res.clone());
      return res;
    });
  }).catch(err => console.error(event.request.url, err));
}

function handleNoCacheMatch(event) {
  return fetchFromNetworkAndCache(event);
}
