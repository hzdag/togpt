// Add script to head to prevent FOUC
const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.classList.add('no-transitions');
    document.documentElement.classList.toggle('dark', getTheme() === 'dark');
    window.addEventListener('load', () => {
      document.documentElement.classList.remove('no-transitions');
    });
  })();
`;

export function injectThemeScript() {
  const script = document.createElement('script');
  script.innerHTML = themeScript;
  document.head.appendChild(script);
}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  
  // Remove transitions temporarily
  root.classList.add('no-transitions');
  
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.toggle('dark', isDark);
  localStorage.setItem('theme', theme);

  // Re-enable transitions after a short delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('no-transitions');
    });
  });

  // Add system theme change listener if using system theme
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      root.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.removeEventListener('change', handleChange); // Remove existing listener
    mediaQuery.addEventListener('change', handleChange); // Add new listener
  }
}