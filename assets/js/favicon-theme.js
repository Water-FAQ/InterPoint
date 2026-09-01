(() => {
  const icons = document.querySelectorAll('link[data-theme-icon]');
  if (!icons.length || !window.matchMedia) return;

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updateIcons = () => {
    icons.forEach((icon) => {
      const nextHref = colorScheme.matches
        ? icon.dataset.darkHref
        : icon.dataset.lightHref;

      if (nextHref && icon.getAttribute('href') !== nextHref) {
        icon.setAttribute('href', nextHref);
      }
    });
  };

  updateIcons();
  if (colorScheme.addEventListener) {
    colorScheme.addEventListener('change', updateIcons);
  } else {
    colorScheme.addListener?.(updateIcons);
  }
})();
