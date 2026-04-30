// Grab all the elements we need
const startBtn = document.getElementById('startBtn');
const modal = document.getElementById('modal');
const installBtn = document.getElementById('installBtn');
const closeBtn = document.getElementById('closeBtn');

// When Start Daily Run is clicked
startBtn.addEventListener('click', function() {
  const extensionInstalled = false;

  if (extensionInstalled) {
    console.log('Extension found — starting run');
  } else {
    // Show the modal instead of an alert
    modal.style.display = 'flex';
  }
});

// When Install Extension is clicked
installBtn.addEventListener('click', function() {
  // This will eventually link to the Chrome Web Store
  alert('Extension coming soon!');
});

// When Maybe Later is clicked
closeBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});

// Close modal if user clicks the dark background
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

