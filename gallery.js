 // Get DOM Elements
 const adminBtn = document.getElementById('admin-btn'); // Admin button
 const adminModal = document.getElementById('admin-modal');
 const closeAdminModal = document.getElementById('close-admin-modal');
 const adminForm = document.getElementById('admin-form');

 // Show Admin Modal
 adminBtn.addEventListener('click', (e) => {
     e.preventDefault(); // Prevent default link behavior
     adminModal.classList.remove('hidden');
 });

 // Close Admin Modal
 closeAdminModal.addEventListener('click', () => {
     adminModal.classList.add('hidden');
 });

 // Form Submission Handling
 adminForm.addEventListener('submit', (e) => {
     e.preventDefault();

     // Collect login details
     const username = document.getElementById('admin-username').value.trim();
     const password = document.getElementById('admin-password').value.trim();

     // Placeholder logic for authentication
     if (username === 'admin' && password === 'password123') {
         window.location.href = './admin.html'; // Redirect to admin page
     } else {
         alert('Invalid login details. Please try again.');
     }

    
 });


 