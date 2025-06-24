// Fetches CHANGELOG.md and displays it in a modal

async function initChangelogModal() {
  const modal = document.getElementById('changelog-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.changelog-close');
  const contentEl = modal.querySelector('.changelog-content');

  // Close handler
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  try {
    const res = await fetch('CHANGELOG.md');
    const text = await res.text();
    contentEl.textContent = text;
  } catch (err) {
    contentEl.textContent = 'Failed to load changelog.';
  }

  modal.style.display = 'flex';
}

if (document.readyState !== 'loading') {
  initChangelogModal();
} else {
  document.addEventListener('DOMContentLoaded', initChangelogModal);
}

export {}; // module indicator
