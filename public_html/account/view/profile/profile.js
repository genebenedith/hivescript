document.addEventListener('DOMContentLoaded', function () {
    // Check for the tab from document data set
    const tab = getTabFromDataset();
    console.log(tab);
    console.log("pie above");
    showTab(tab)
});

function getTabFromDataset() {
    const activeTabElement = document.querySelector('.profile-content[data-initial-tab="active"]');
    return activeTabElement ? activeTabElement.id : 'profile';
}

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.profile-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Show the selected tab
    document.getElementById(tabId).style.display = 'block';
}

function toggleAllCheckboxes(checkbox) {
    const checkboxes = document.querySelectorAll('.mail_list input[type="checkbox"]');
    
    checkboxes.forEach((individualCheckbox) => {
        individualCheckbox.checked = checkbox.checked;
    });
}

function deleteNotifications(username) {
    const checkboxes = document.querySelectorAll('.mail_list input[type="checkbox"]:checked');
    // Create an array to store the IDs of checked notifications
    const checkedNotificationIds = [];

    checkboxes.forEach((checkbox) => {
        // Extract notification ID from checkbox ID
        const notificationId = checkbox.id.replace('notification_checkbox_', '');
        checkedNotificationIds.push(notificationId);
    });

    // Send the array of checked notification IDs to the server for deletion
    try {
        const response = fetch('/user/delete-notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username, 
                notificationIds: checkedNotificationIds,
            }),
        })
        .then((response) => {
            if (response.status === 200) {
                console.log('Notifications deleted successfully.');
                window.location.href = `/profile/${username}`;
            } else {
                console.error('Failed to delete notifications.');
            }
        })
       .catch((error) => {
            console.error('Error while deleting notifications:', error);
        });
    } catch (error) {
        console.error('Something went wrong:', error);
    }
};

// Handle opened notifications
function readNotifications(username) {
    try {
        fetch('/user/mark-notifications-as-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        console.log('Notifications marked as read.');
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
};