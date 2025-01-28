 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
 import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
 import { getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


 
 
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
   apiKey: "AIzaSyBS59aKUsLSYDPwpF5BmVk7AdeWRBgrRHw",
   authDomain: "adorahdebaa.firebaseapp.com",
   projectId: "adorahdebaa",
   storageBucket: "adorahdebaa.firebasestorage.app",
   messagingSenderId: "864472181612",
   appId: "1:864472181612:web:0c96f54dbc4d082fd2e149",
   measurementId: "G-234QM140XC"
 };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const db = getFirestore(app);
// Reference to the RSVP collection
const rsvpCollection = collection(db, "rsvps");





// Get DOM Elements
let rsvpBtn = document.querySelector('.cta-btn'); // RSVP Now button
const modal = document.getElementById('rsvp-modal');
const closeModal = document.getElementById('close-modal');
const rsvpForm = document.getElementById('rsvp-form');

// Show Modal
rsvpBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    modal.classList.remove('hidden');
});

// Close Modal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Dynamic Contact Input Handling
const contactRadios = document.querySelectorAll('.contact-radio');
const contactInputDiv = document.getElementById('contact-input');
const contactLabel = document.getElementById('contact-label');
const contactInfo = document.getElementById('contact-info');

// Listen for changes on the contact method radio buttons
contactRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        const selectedValue = e.target.value;

        // Update label and placeholder based on selected method
        if (selectedValue === 'email') {
            contactLabel.textContent = 'Your Email Address';
            contactInfo.placeholder = 'e.g., you@example.com';
            contactInfo.type = 'email';
        } else if (selectedValue === 'whatsapp') {
            contactLabel.textContent = 'Your WhatsApp Number (Please include country code)';
            contactInfo.placeholder = 'e.g., +1-234-567-8901';
            contactInfo.type = 'tel';
        }

        // Show the contact input field
        contactInputDiv.classList.remove('hidden');
        contactInfo.required = true; // Make the field required
    });
});

// RSVP Form Handling
const attendingOptions = document.querySelectorAll('.attending-option');
const partnerNameField = document.getElementById('partner-name-field');

attendingOptions.forEach(option => {
    option.addEventListener('change', () => {
        if (option.value === 'with partner' && option.checked) {
            partnerNameField.classList.remove('hidden');
        } else {
            partnerNameField.classList.add('hidden');
        }
    });
});

// Form Submission Handling
// Get DOM Elements for QR Code modal and messages
const qrModal = document.getElementById('qr-code-modal');
const closeQrModal = document.getElementById('close-qr-modal');
const qrCodeDiv = document.getElementById('qrcode');
const thankYouMessage = document.getElementById('thank-you-message');
const infoMessage = document.getElementById('info-message');


// RSVP Form Submission Handling to generate QR Code
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the submit button
  const submitButton = rsvpForm.querySelector('button[type="submit"]');
  
  // Disable the submit button and update its text
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

    // Collect form data
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const attendance = document.querySelector('input[name="attending"]:checked').value;
    const contactMethod = document.querySelector('input[name="contact-method"]:checked').value;
    const contactDetail = document.getElementById('contact-info').value.trim();
    const partnerName = document.querySelector('#partner-name').value.trim();

    // Prepare data object
    const rsvpData = {
        firstName,
        lastName,
        attendance,
        contactMethod,
        contactDetail,
        partnerName,
        timestamp: new Date().toISOString(),
    };

    try {
        // Save RSVP data to Firestore
        await addDoc(collection(db, "rsvps"), rsvpData);

        // Construct QR code URL
        const qrData = `
          RSVP Details

          Name: ${firstName} ${lastName}
          Attending: ${attendance} 
          Partner's Name: ${partnerName} 
          Contact Method: ${contactMethod} 
          Contact Detail: ${contactMethod === "email"
        ? contactDetail.replace('@', '＠').replace('.', '․')
        : contactDetail.replace(/(\d{3})(\d{3})(\d{4})/, '$1\u200B-$2\u200B-$3')
      }`;

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        // Create Image for QR Code
        const qrImage = new Image();
        qrImage.src = qrImageUrl;
        qrImage.onload = () => {
            // Hide the RSVP modal
            modal.classList.add('hidden');

            // Show the QR Code modal
            qrModal.classList.remove('hidden');
            
            // Append the QR code image to the modal
            qrCodeDiv.appendChild(qrImage);

            // Display the dynamic messages
            thankYouMessage.innerHTML = `Thank you, ${firstName}! Your RSVP has been successfully recorded.`;

             // Re-enable the submit button and reset text
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
        };

        qrImage.onerror = (error) => {
            console.error("Error loading QR code:", error);
            qrCodeDiv.innerHTML = "Error loading QR code. Please try again.";

               // Re-enable the submit button and reset text
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
        };
    } catch (error) {
        console.error("Error saving RSVP to Firestore:", error);
        alert("Failed to submit your RSVP. Please try again.");

            // Re-enable the submit button and reset text
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
    }
});


// Close QR Code Modal
closeQrModal.addEventListener('click', () => {
    // Clear QR code image
    qrCodeDiv.innerHTML = '';

    // Reset the form fields
    rsvpForm.reset();

    // Hide the QR Code modal
    qrModal.classList.add('hidden');
});



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

 document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("index.html") || currentPage === "/") {
        // Code specific to the index page
        initializeIndexPage();
    } else if (currentPage.includes("admin.html")) {
        // Code specific to the admin page
        fetchAndRenderRSVPData();
        
    }
});

function initializeIndexPage() {
    // Add index page-specific logic here (e.g., login form handling)
    const adminForm = document.getElementById("admin-form");
    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("admin-username").value.trim();
            const password = document.getElementById("admin-password").value.trim();

            if (username === "admin" && password === "password123") {
                window.location.href = "./admin.html";
            } else {
                alert("Invalid login details. Please try again.");
            }
        });
    }
}


// Countdown Timer
document.addEventListener("DOMContentLoaded", () => {
    // Set the wedding date
    const weddingDate = new Date("2025-04-19T00:00:00");

    // Get elements for each time unit
    const monthsElement = document.querySelector("#month");
    const daysElement = document.querySelector("#days");
    const hoursElement = document.querySelector("#hours");
    const minutesElement = document.querySelector("#minutes");
    const secondsElement = document.querySelector("#seconds");

    function updateCountdown() {
        const now = new Date();
        const timeDiff = weddingDate - now;

        if (timeDiff <= 0) {
            // If the countdown is over
            document.getElementById("countdown").innerHTML =
                "<p class='text-4xl font-bold'>Today is the big day! 🎉</p>";
            return;
        }

        // Calculate time components
        const totalSeconds = Math.floor(timeDiff / 1000);
        const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60)); // Approximate months
        const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        // Update the countdown elements
        monthsElement.textContent = String(months).padStart(2, "0");
        daysElement.textContent = String(days).padStart(2, "0");
        hoursElement.textContent = String(hours).padStart(2, "0");
        minutesElement.textContent = String(minutes).padStart(2, "0");
        secondsElement.textContent = String(seconds).padStart(2, "0");
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Run initially to avoid delay
});
