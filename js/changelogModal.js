// Handles displaying the CHANGELOG in a modal when requested

function setupChangelogModal() {
  const modal = document.getElementById('changelog-modal');
  const button = document.getElementById('changelog-button');
  if (!modal || !button) return;

  const closeBtn = modal.querySelector('.changelog-close');
  const contentEl = modal.querySelector('.changelog-content');
  let loaded = false;

  async function openModal() {
    if (!loaded) {
      try {
        const res = await fetch('CHANGELOG.md');
        const text = await res.text();
        contentEl.textContent = text;
      } catch (err) {
        contentEl.textContent = 'Failed to load changelog.';
      }
      loaded = true;
    }
    modal.style.display = 'flex';
  }

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  button.addEventListener('click', openModal);
}

if (document.readyState !== 'loading') {
  setupChangelogModal();
} else {
  document.addEventListener('DOMContentLoaded', setupChangelogModal);
}

export {}; // module indicator
