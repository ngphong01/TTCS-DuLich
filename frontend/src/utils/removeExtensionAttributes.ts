// Utility to remove browser extension attributes that cause hydration errors
export function removeExtensionAttributes() {
  if (typeof window === 'undefined') return;

  // Remove bis_skin_checked attributes
  const elementsWithBisSkin = document.querySelectorAll('[bis_skin_checked]');
  elementsWithBisSkin.forEach(element => {
    element.removeAttribute('bis_skin_checked');
  });

  // Remove other common browser extension attributes
  const extensionAttributes = [
    'bis_skin_checked',
    'data-bis_skin_checked',
    'data-bis-skin-checked',
    'bis_skin_checked_1',
    'bis_skin_checked_2'
  ];

  extensionAttributes.forEach(attr => {
    const elements = document.querySelectorAll(`[${attr}]`);
    elements.forEach(element => {
      element.removeAttribute(attr);
    });
  });
}

// Run on DOM content loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', removeExtensionAttributes);
  
  // Also run after a short delay to catch dynamically added attributes
  setTimeout(removeExtensionAttributes, 100);
  setTimeout(removeExtensionAttributes, 500);
  setTimeout(removeExtensionAttributes, 1000);
}
