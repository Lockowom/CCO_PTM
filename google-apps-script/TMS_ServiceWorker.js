/**
 * TMS Service Worker - PWA Offline Functionality
 * Service Worker para funcionalidad offline de la aplicación móvil TMS
 * 
 * @fileoverview Service Worker para cacheo y funcionalidad offline
 * @author Sistema CCO
 * @version 1.0.0
 */

const CACHE_NAME = 'tms-mobile-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/TMS_Index.html',
  '/TMS_Mobile_Index.html',
  '/TMS_Mobile_Tasks.html',
  '/TMS_Mobile_Navigation.html',
  '/offline.html',
  // External resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/getTMSDrivers/,
  /\/getTMSActiveDeliveries/,
  /\/getTMSDriverLocations/,
  /\/getTMSVehicles/
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('TMS Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('TMS Service Worker: Caching app shell');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('TMS Service Worker: App shell cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('TMS Service Worker: Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('TMS Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('TMS Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('TMS Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, cache the response and return it
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, serve offline page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Handle API requests
  if (isApiRequest(request)) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }
  
  // Handle static resources
  if (isStaticResource(request)) {
    event.respondWith(
      handleStaticResource(request)
    );
    return;
  }
  
  // Default: try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle API requests with cache-first strategy for GET requests
function handleApiRequest(request) {
  if (request.method === 'GET') {
    // Cache-first strategy for GET requests
    return caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache and update in background
          fetchAndCache(request);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetchAndCache(request);
      })
      .catch(() => {
        // Return cached data if available, otherwise return error response
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline response for API calls
            return new Response(
              JSON.stringify({
                error: 'Offline - No cached data available',
                offline: true,
                timestamp: new Date().toISOString()
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          });
      });
  } else {
    // Network-first strategy for POST/PUT/DELETE requests
    return fetch(request)
      .then((response) => {
        // Don't cache non-GET requests, but store them for sync later
        if (response.status >= 200 && response.status < 300) {
          storeForSync(request);
        }
        return response;
      })
      .catch(() => {
        // Store failed requests for later sync
        storeForSync(request);
        
        return new Response(
          JSON.stringify({
            error: 'Offline - Request queued for sync',
            offline: true,
            queued: true,
            timestamp: new Date().toISOString()
          }),
          {
            status: 202,
            statusText: 'Accepted',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      });
  }
}

// Handle static resources with cache-first strategy
function handleStaticResource(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        });
    });
}

// Fetch and cache helper function
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return response;
    });
}

// Check if request is for API
function isApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if it matches any API cache patterns
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.pathname.includes('/exec') ||
         url.searchParams.has('action');
}

// Check if request is for static resource
function isStaticResource(request) {
  const url = new URL(request.url);
  const extension = url.pathname.split('.').pop();
  
  return ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2', 'ttf'].includes(extension) ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'cdnjs.cloudflare.com';
}

// Store failed requests for background sync
function storeForSync(request) {
  // In a real implementation, this would store the request in IndexedDB
  // for later synchronization when the connection is restored
  console.log('TMS Service Worker: Storing request for sync:', request.url);
  
  // For now, we'll just log it
  // TODO: Implement IndexedDB storage for offline requests
}

// Background sync event (when connection is restored)
self.addEventListener('sync', (event) => {
  console.log('TMS Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'tms-sync') {
    event.waitUntil(
      syncOfflineRequests()
    );
  }
});

// Sync offline requests when connection is restored
function syncOfflineRequests() {
  console.log('TMS Service Worker: Syncing offline requests...');
  
  // TODO: Implement actual sync logic
  // 1. Retrieve stored requests from IndexedDB
  // 2. Attempt to send each request
  // 3. Remove successfully sent requests from storage
  // 4. Keep failed requests for next sync attempt
  
  return Promise.resolve();
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('TMS Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación TMS',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('TMS - Sistema de Transporte', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('TMS Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event (communication with main thread)
self.addEventListener('message', (event) => {
  console.log('TMS Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: true
          });
        })
        .catch((error) => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: false,
            error: error.message
          });
        })
    );
  }
});

// Error event
self.addEventListener('error', (event) => {
  console.error('TMS Service Worker: Error:', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  console.error('TMS Service Worker: Unhandled rejection:', event.reason);
});

console.log('TMS Service Worker: Loaded successfully');