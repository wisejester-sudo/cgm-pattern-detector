// Service Worker for Dispatchly
// Handles push notifications and offline caching

const CACHE_NAME = 'dispatchly-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/jobs',
  '/technicians',
  '/manifest.json',
  '/logo.svg'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API calls
  if (request.url.includes('/api/')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached version or fetch from network
      return (
        cached ||
        fetch(request).then((response) => {
          // Cache new requests
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
      )
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: data.tag || 'default',
    requireInteraction: true,
    actions: data.actions || [],
    data: data.data || {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { action, notification } = event
  const data = notification.data

  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(data.url || '/dashboard')
    )
  } else if (action === 'dismiss') {
    // Just close the notification
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow(data.url || '/dashboard')
    )
  }
})

// Background sync for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jobs') {
    event.waitUntil(syncOfflineJobs())
  }
})

async function syncOfflineJobs() {
  // Get queued jobs from IndexedDB and sync them
  // This would need to be implemented with the actual sync logic
  console.log('Syncing offline jobs...')
}
