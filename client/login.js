function setupAuthHandlers() {
  const loginForm = document.querySelector(`#auth-content-container form`);
  if (loginForm && !loginForm.dataset.bound) {
    loginForm.dataset.bound = "true";
    console.log("✅ Login form bound!");

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rollno = document.getElementById(`modal-login-student-id`).value.trim();
      const password = document.getElementById(`modal-login-password`).value.trim();

      if (!rollno || !password) {
        alert("Please enter both roll number and password");
        return;
      }

      try {
        const res = await fetch(`/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollno, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(`Welcome ${data.user.name}!`);
          window.location.href = '/allocator.html';
        } else {
          alert(`Login failed: ${data.error || 'Invalid credentials'}`);
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong, please try again later");
      }
    });
  }

  const signupForm = document.querySelectorAll('#auth-content-container form')[1];
  if (signupForm && !signupForm.dataset.bound) {
    signupForm.dataset.bound = "true";
    console.log("✅ Signup form bound!");

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('modal-signup-name').value.trim();
      const rollNo = document.getElementById('modal-signup-student-id').value.trim();
      const email = document.getElementById('modal-signup-email').value.trim();
   if (!name || !rollNo || !email) {
        alert("Please fill out all required fields.");
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, rollNo, email })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          alert(`User ${data.user.name} registered successfully!`);
        } else {
          alert(`Signup failed: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
      }
    });
  }
}


