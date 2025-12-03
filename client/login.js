function setupAuthHandlers() {
  // LOGIN FORM HANDLER
  const loginForm = document.querySelector(`#auth-content-container form`);
  if (loginForm && !loginForm.dataset.bound) {
    loginForm.dataset.bound = "true";
    console.log("✅ Login form bound!");

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rollNo = document.getElementById(`modal-login-student-id`).value.trim();
      const password = document.getElementById(`modal-login-password`).value.trim();

      if (!rollNo || !password) {
        alert("Please enter both roll number and password");
        return;
      }

      try {
        const res = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNo, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(`Welcome ${data.user.name}!`);
          localStorage.setItem("token", data.token); // save token for allocator access
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.user.role === 'admin') {
            window.location.href = '/admin.html';
          } 
          else if (data.user.role === 'driver') {
            window.location.href = '/driver.html'; 
          } else {
            window.location.href = '/allocator.html';
          }
          updateAuthButton();
        } else {
          alert(`Login failed: ${data.message || data.error || 'Invalid credentials'}`);
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong, please try again later");
      }
    });
  }

  // SIGNUP FORM HANDLER
// SIGNUP FORM HANDLER
const signupForm = document.querySelectorAll('#auth-content-container form')[1];
if (signupForm && !signupForm.dataset.bound) {
  signupForm.dataset.bound = "true";
  console.log("✅ Signup form bound!");

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log("🚀 Form submitted!");
  
    const name = document.getElementById('modal-signup-name').value.trim();
    const rollNo = document.getElementById('modal-signup-student-id').value.trim();
    const password = document.getElementById('modal-signup-password').value.trim();
    const profilePhotoInput = document.getElementById('modal-signup-profile-photo');
    const profilePhoto = profilePhotoInput.files[0];
    
    console.log("📝 Form values:", { name, rollNo, password: password ? "SET" : "MISSING", profilePhoto: profilePhoto ? profilePhoto.name : "No file" });
  
    if (!name || !rollNo || !password) {
      alert("Please fill out all required fields.");
      return;
    }
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('rollNo', rollNo);
    formData.append('password', password);
    formData.append('role', 'student');
    formData.append('disability', 'false');   
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
      console.log("📷 Photo attached:", profilePhoto.name, profilePhoto.size, "bytes");
    }

    // Debug: Log what's in FormData
    console.log("📦 FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }

    try {
      console.log("📤 Sending request to /api/auth/register...");
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
        // DO NOT set Content-Type header - let browser set it with boundary
      });
      
      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", res.headers);
      
      const data = await res.json();
      console.log("📥 Response data:", data);
      
      if (res.ok && data.success) {
        alert(`User ${data.user.name} registered successfully!`);
        signupForm.reset();
        document.getElementById('photo-filename').textContent = 'No file chosen';
      } else {
        alert(`Signup failed: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("Something went wrong. Check console.");
    }
  });
}

  // FORGOT PASSWORD HANDLER
  const forgotLink = document.getElementById('forgot-password-link');
  if (forgotLink && !forgotLink.dataset.bound) {
    forgotLink.dataset.bound = "true";
    forgotLink.addEventListener('click', async (e) => {
      e.preventDefault();

      const rollNo = prompt("Enter your roll number:");
      if (!rollNo) return alert("Roll number required");

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo })
      });

      const data = await res.json();
      if (data.success) {
        const code = prompt(`Enter the reset code (for now it's: ${data.code})`);
        const newPassword = prompt("Enter your new password:");
        const reset = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNo, resetCode: code, newPassword })
        });

        const result = await reset.json();
        alert(result.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    });
  }
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateAuthButton();
  window.location.href = "/index.html";
}

function updateAuthButton() {
    const authButton = document.getElementById('auth-button');
    if (!authButton) return;

    // Check if the token exists in localStorage
    const token = localStorage.getItem("token");

    if (token) {
        // User is LOGGED IN: Change button to LOGOUT
        authButton.textContent = 'Logout';
    } else {
        // User is LOGGED OUT: Change button to LOGIN
        authButton.textContent = 'Login';
    }
}

/* Determines whether to toggle the Login Modal or call Logout, based on auth status. */
function handleAuthClick() {
    const token = localStorage.getItem("token");
    
    if (token) {
        // If token exists, the button says 'Logout', so we log them out.
        logoutUser();
    } else {
        // If no token, the button says 'Login', so we open the modal.
        toggleModal();
    }
}
