(() => {
  if (window.fbq) return;
  const tracker = function () {
    if (tracker.callMethod) tracker.callMethod.apply(tracker, arguments);
    else tracker.queue.push(arguments);
  };
  tracker.queue = [];
  tracker.push = tracker;
  tracker.loaded = true;
  tracker.version = '2.0';
  window.fbq = window._fbq = tracker;
  tracker('init', '1528378295120841');
  tracker('track', 'PageView');
  const loadTracker = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.append(script);
  };
  const scheduleTracker = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadTracker, { timeout: 2000 });
    else setTimeout(loadTracker, 1000);
  };
  if (document.readyState === 'complete') scheduleTracker();
  else window.addEventListener('load', scheduleTracker, { once: true });
})();
