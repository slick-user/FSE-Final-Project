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
        const res = await fetch(`/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNo, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(`Welcome ${data.user.name}!`);
          localStorage.setItem("token", data.token); // save token for allocator access
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.user.role == 'admin') {
            window.location.href = '/admin.html';
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
  const signupForm = document.querySelectorAll('#auth-content-container form')[1];
  if (signupForm && !signupForm.dataset.bound) {
    signupForm.dataset.bound = "true";
    console.log("✅ Signup form bound!");

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('modal-signup-name').value.trim();
      const rollNo = document.getElementById('modal-signup-student-id').value.trim();
      const password = document.getElementById('modal-signup-password').value.trim();

      if (!name || !rollNo || !password) {
        alert("Please fill out all required fields.");
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            rollNo,
            password,
            role: 'student',        // defaults for now
            disability: false      // same here
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(`User ${data.user.name} registered successfully!`);
        } else {
          alert(`Signup failed: ${data.message || data.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
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

      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo })
      });

      const data = await res.json();
      if (data.success) {
        const code = prompt(`Enter the reset code (for now it's: ${data.code})`);
        const newPassword = prompt("Enter your new password:");
        const reset = await fetch('/api/reset-password', {
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
