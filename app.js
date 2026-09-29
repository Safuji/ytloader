const form = document.querySelector('#download-form');
const urlInput = document.querySelector('#youtube-url');
const status = document.querySelector('#status');
const button = document.querySelector('#download-button');

function setStatus(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function isYouTubeUrl(value) {
  try {
    const url = new URL(value);
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname);
  } catch {
    return false;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();

  if (!isYouTubeUrl(url)) {
    setStatus('Please enter a valid YouTube URL.', 'error');
    urlInput.focus();
    return;
  }

  button.disabled = true;
  setStatus('Preparing your download...');

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'The download could not be completed.');
    }

    const result = await response.json();
    setStatus(`Saved ${result.fileName} to the downloads folder.`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
});
