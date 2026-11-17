{
  const nexusEnv = window.nexusEnv || {};
  const scripts = [
    nexusEnv.NODE_ENV === 'development'
      ? '/renderer.dev.js'
      : './renderer.prod.js'
  ];

  for (const source of scripts) {
    const script = document.createElement('script');
    script.src = source;
    script.async = false;
    document.head.appendChild(script);
  }

  window.addEventListener('load', () => {
    document.addEventListener('auxclick', (event) => {
      if (event.button === 1 || event.ctrlKey) {
        event.preventDefault();
      }
    });
  });
}
