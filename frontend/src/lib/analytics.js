const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

// Initialize GA4 script
export const initAnalytics = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID is missing. Analytics is disabled.');
    return;
  }

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
  `;
  document.head.appendChild(script2);
};

// Track Page View
export const trackPageView = (url) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: url,
  });
};

// Track Event
export const trackEvent = (eventName, eventParams = {}) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', eventName, eventParams);
};
