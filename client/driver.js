// Driver Dashboard JavaScript

let currentDriver = null;
let driverRoutes = [];

// Check authentication and driver role on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkDriverAccess();
    await loadDriverProfile();
    await loadDriverRoutes();
    await loadNotifications();
});

// Check if user is logged in and has driver role
function checkDriverAccess() {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userJson || !token) {
        alert("Access Denied: Please log in.");
        window.location.href = '/index.html';
        return false;
    }

    try {
        const user = JSON.parse(userJson);
        if (user.role !== 'driver') {
            alert("Access Denied: This page is for drivers only.");
            if (user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/allocator.html';
            }
            return false;
        }
        currentDriver = user;
        return true;
    } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Access Denied: Invalid user data.");
        window.location.href = '/index.html';
        return false;
    }
}

//Load driver profile information
async function loadDriverProfile() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            currentDriver = data.user;
            displayDriverProfile(data.user);
        } else {
            // Fallback to localStorage data
            displayDriverProfile(currentDriver);
        }
    } catch (error) {
        console.error('Error loading driver profile:', error);
        displayDriverProfile(currentDriver);
    }
}

// Display driver profile information
function displayDriverProfile(driver) {
    document.getElementById('driver-name').textContent = driver.name || 'Driver';
    document.getElementById('driver-roll').textContent = `Roll No: ${driver.rollNo || '---'}`;

    const photoElement = document.getElementById('driver-photo');
    if (driver.profilePhoto) {
        photoElement.src = driver.profilePhoto;
    } else {
        photoElement.src = 'https://via.placeholder.com/150?text=Driver';
    }

    if (driver.driverProfile) {
        document.getElementById('driver-license').textContent =
            driver.driverProfile.licenseNumber || 'Not Set';
        document.getElementById('driver-phone').textContent =
            driver.driverProfile.phoneNumber || 'Not Set';

        const assignedId = driver.driverProfile.assignedBus;
        if (assignedId) {
            fetchBusDetails(assignedId);
        } else {
            fetchLinkedBusForDriver(driver._id).then(bus => {
                if (bus) {
                    document.getElementById('driver-bus').textContent = `${bus.busNumber} (${bus.model})`;
                } else {
                    document.getElementById('driver-bus').textContent = 'Not Assigned';
                }
            }).catch(() => {
                document.getElementById('driver-bus').textContent = 'Not Assigned';
            });
        }

        updateAvailabilityButton(driver.driverProfile.available);
    } else {
        document.getElementById('driver-license').textContent = 'Not Set';
        document.getElementById('driver-phone').textContent = 'Not Set';
        document.getElementById('driver-bus').textContent = 'Not Assigned';
        updateAvailabilityButton(true);
    }
}

// Fetch bus details
async function fetchBusDetails(busId) {
    try {
        const res = await fetch(`/api/buses/${busId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const response = await res.json();
            const bus = response.data || response;
            if (bus && bus.busNumber) {
                document.getElementById('driver-bus').textContent = `${bus.busNumber} (${bus.model || ''})`;
            }
        }
    } catch (error) {}
}

async function fetchLinkedBusForDriver(userId) {
    try {
        const res = await fetch(`/api/buses?linkedUser=${encodeURIComponent(userId)}`);
        if (!res.ok) return null;
        const response = await res.json();
        const buses = Array.isArray(response) ? response : (response.data || []);
        return buses[0] || null;
    } catch (_) {
        return null;
    }
}

async function getAssignedBusId() {
    const direct = currentDriver?.driverProfile?.assignedBus;
    if (direct) return direct;
    const bus = await fetchLinkedBusForDriver(currentDriver?._id);
    return bus ? bus._id : null;
}

/**
 * Update availability button display
 */
function updateAvailabilityButton(isAvailable) {
    const button = document.getElementById('status-toggle');
    if (isAvailable) {
        button.textContent = 'Available';
        button.className = 'px-4 py-2 rounded font-semibold transition bg-green-500 text-white hover:bg-green-600';
    } else {
        button.textContent = 'Unavailable';
        button.className = 'px-4 py-2 rounded font-semibold transition bg-red-500 text-white hover:bg-red-600';
    }
}

/**
 * Toggle driver availability
 */
async function toggleAvailability() {
    const newStatus = !currentDriver.driverProfile?.available;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/drivers/availability', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ available: newStatus })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                // Update local state
                if (!currentDriver.driverProfile) {
                    currentDriver.driverProfile = {};
                }
                currentDriver.driverProfile.available = newStatus;

                // Update localStorage
                localStorage.setItem('user', JSON.stringify(currentDriver));

                // Update UI
                updateAvailabilityButton(newStatus);

                alert(`Status updated to ${newStatus ? 'Available' : 'Unavailable'}`);
            }
        } else {
            alert('Failed to update availability status');
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
        alert('Error updating status. Please try again.');
    }
}

//Load driver's assigned routes
async function loadDriverRoutes() {
    const routesContainer = document.getElementById('routes-container');

    try {
        const busId = await getAssignedBusId();

        if (!busId) {
            routesContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No bus assigned yet</p>';
            return;
        }

        const res = await fetch(`/api/drivers/routes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            const data = await res.json();
            driverRoutes = data.data || [];

            if (driverRoutes.length === 0) {
                routesContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No routes assigned yet</p>';
            } else {
                displayRoutes(driverRoutes);
            }
        } else {
            routesContainer.innerHTML = '<p class="text-red-500 text-center py-8">Failed to load routes</p>';
        }
    } catch (error) {
        console.error('Error loading routes:', error);
        routesContainer.innerHTML = '<p class="text-red-500 text-center py-8">Error loading routes</p>';
    }
}

//Display routes in cards
function displayRoutes(routes) {
    const container = document.getElementById('routes-container');

    // Sort routes by date and time
    const sortedRoutes = routes.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
        }
        return a.departureTime.localeCompare(b.departureTime);
    });

    container.innerHTML = sortedRoutes.map(route => {
        const date = new Date(route.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            running: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const statusColor = statusColors[route.status] || 'bg-gray-100 text-gray-800';

        return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-semibold">${escapeHtml(route.routeName || 'Route')}</h3>
            <p class="text-sm text-gray-600">${formattedDate} at ${route.departureTime}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
            ${route.status}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span class="text-gray-600">Stop:</span>
            <span class="font-medium">${escapeHtml(route.stop?.name || 'N/A')}</span>
          </div>
          <div>
            <span class="text-gray-600">Zone:</span>
            <span class="font-medium">${escapeHtml(route.stop?.zone || 'N/A')}</span>
          </div>
          <div>
            <span class="text-gray-600">Seats Booked:</span>
            <span class="font-medium">${route.seatsBooked || 0} / ${route.bus?.capacity || 40}</span>
          </div>
        </div>

        ${route.status === 'scheduled' ? `
          <button 
            onclick="updateRouteStatus('${route._id}', 'running')"
            class="w-full bg-fastBlue text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Start Route
          </button>
        ` : ''}
        
        ${route.status === 'running' ? `
          <button 
            onclick="updateRouteStatus('${route._id}', 'completed')"
            class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Complete Route
          </button>
        ` : ''}
      </div>
    `;
    }).join('');
}

//Update route status
async function updateRouteStatus(scheduleId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/drivers/routes/${scheduleId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert(`Route status updated to ${newStatus}`);
            await loadDriverRoutes(); // Reload routes

            // Add notification
            addNotification(`Route status changed to ${newStatus}`, 'success');
        } else {
            alert('Failed to update route status');
        }
    } catch (error) {
        console.error('Error updating route status:', error);
        alert('Error updating route. Please try again.');
    }
}

// Load notifications
async function loadNotifications() {
    const container = document.getElementById('notifications-container');

    // Get notifications from localStorage or generate based on recent routes
    const notifications = getRecentNotifications();

    if (notifications.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No new notifications</p>';
    } else {
        container.innerHTML = notifications.map(notif => `
      <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded border-l-4 ${notif.type === 'success' ? 'border-green-500' :
                notif.type === 'warning' ? 'border-yellow-500' :
                    'border-blue-500'
            }">
        <div class="flex-1">
          <p class="font-medium">${escapeHtml(notif.message)}</p>
          <p class="text-xs text-gray-500">${notif.time}</p>
        </div>
      </div>
    `).join('');
    }
}

//Get recent notifications
function getRecentNotifications() {
    const stored = localStorage.getItem('driver_notifications');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }

    // Generate sample notifications based on routes
    const notifications = [];

    if (driverRoutes.length > 0) {
        const upcomingRoutes = driverRoutes.filter(r => r.status === 'scheduled');
        if (upcomingRoutes.length > 0) {
            notifications.push({
                message: `You have ${upcomingRoutes.length} upcoming route(s)`,
                time: 'Just now',
                type: 'info'
            });
        }
    }

    return notifications;
}

//Add a notification
function addNotification(message, type = 'info') {
    const notifications = getRecentNotifications();
    notifications.unshift({
        message,
        time: new Date().toLocaleTimeString(),
        type
    });

    // Keep only last 10 notifications
    if (notifications.length > 10) {
        notifications.pop();
    }

    localStorage.setItem('driver_notifications', JSON.stringify(notifications));
    loadNotifications();
}

//Logout driver
function logoutDriver() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_notifications');
    window.location.href = '/index.html';
}

//Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
