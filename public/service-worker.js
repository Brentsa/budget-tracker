const APP_PREFIX = 'Budget Tracker';
const VERSION = 'V1.0';
const CACHE_NAME = APP_PREFIX + ' ' + VERSION;
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./js/index.js",
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
    "./js/idb.js"
]

//Service worker installation - uploading files to browser cache
self.addEventListener('install', function(event){
    //Wait until all the functions inside are executed before installing.
    event.waitUntil(
        //create a new cache with the cache name
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Installing cache: ' + CACHE_NAME);
            //add all files to the cache following successful installation
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

//Service worker activation - clear out old cache data and provide instructions on cache management
self.addEventListener('activate', function(event){
    event.waitUntil(
        //Acquire all the keys in the cache array
        caches.keys()
        .then(keyList => {
            //filter the list to only include the budget tracker cache
            let cacheKeepList = keyList.filter(key => key.indexOf(APP_PREFIX));
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(keyList.map((key, i) => {
                if(cacheKeepList.indexOf(key) === -1){
                    console.log('deleting cache: ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }))
        })
    );
});

//Instruct the service worker how to receive information from the cache
self.addEventListener('fetch', function(event){
    //wait for a fetch event and then determine how to respond to the request
    console.log('fetch request: ' + event.request.url);
    event.respondWith(
        caches.match(event.request)
        .then(request => {
            //if the resource already exists in the cache then return the resource
            //if the resource is not in the cache then fetch it from the server
            return request || fetch(event.request);
        })
    )
});
