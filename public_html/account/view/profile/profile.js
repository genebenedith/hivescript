// Final Project: HiveScript Collaborative Code Editor
// Course: CSC 337 - Web Programming (Fall 2023)
// Team Members: 
// - Genesis Benedith
// - Shri Varshini Karthikeyan
// - Shannon Puno
// - Julia Ryan
document.addEventListener('DOMContentLoaded', function () {
    // Check for the tab from document data set
    const tab = getTabFromDataset();
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

// Handle changes to user account 
function saveChanges(user) {
    // Get values from input fields
    var firstName = document.getElementById("first-name-input").value;
    var lastName = document.getElementById("last-name-input").value;
    var username = document.getElementById("username-input").value;
    var displayName = document.getElementById("display-name-input").value;

    // Create an object with the updated user information
    var updatedUserInfo = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        displayName: displayName
    };

    try {
        fetch(`/profile/${user}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ updatedUserInfo }),
        });
        console.log('Profile information updated.');
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
};


