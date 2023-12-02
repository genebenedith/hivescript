document.addEventListener('DOMContentLoaded', function () {
    // Check for the tab parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    // Activate the corresponding tab
    if (tabParam) {
        const tabId = `#${tabParam}-tab`;
        const tabElement = document.querySelector(tabId);
        if (tabElement) {
            tabElement.classList.add('active');
        }
    }
});

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.profile-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Show the selected tab
    document.getElementById(tabId).style.display = 'block';
}
