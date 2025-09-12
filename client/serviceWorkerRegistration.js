// serviceWorkerRegistration.js

export function register(config) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);

          // Check if there's already a waiting service worker
          if (registration.waiting) {
            if (config && config.onUpdate) config.onUpdate(registration);
          }

          // Detect when a new service worker is installed
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // A new version is available
                console.log("🔄 New content available!");
                if (config && config.onUpdate) config.onUpdate(registration);
              }
            };
          };
        })
        .catch((error) => {
          console.log("❌ Service Worker registration failed:", error);
        });
    });
  }
}

// Call this to activate the waiting service worker and reload
export function updateServiceWorker(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload once the new SW takes control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }
}