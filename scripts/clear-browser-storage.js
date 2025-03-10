// This script can be included in your HTML to clear browser storage
// You can copy this to your browser console or create a bookmarklet

(function clearSolidStorage() {
  console.log('Clearing Solid-related items from localStorage...');
  
  // Count of items removed
  let removedCount = 0;
  
  // Clear all Solid-related items from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('solid-') || key.includes('oidc'))) {
      console.log(`Removing: ${key}`);
      localStorage.removeItem(key);
      removedCount++;
      // Adjust index since we're removing items
      i--;
    }
  }
  
  console.log(`Cleared ${removedCount} items from localStorage.`);
  
  // Check if we're in a browser context
  if (typeof window !== 'undefined') {
    console.log('Reloading page...');
    window.location.reload();
  }
})();

// To create a bookmarklet, use this code (minified version):
// javascript:(function(){console.log('Clearing Solid-related items from localStorage...');let e=0;for(let o=0;o<localStorage.length;o++){const r=localStorage.key(o);r&&(r.startsWith('solid-')||r.includes('oidc'))&&(console.log(`Removing: ${r}`),localStorage.removeItem(r),e++,o--)}console.log(`Cleared ${e} items from localStorage.`),'undefined'!=typeof window&&(console.log('Reloading page...'),window.location.reload())})(); 