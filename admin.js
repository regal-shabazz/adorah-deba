// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS59aKUsLSYDPwpF5BmVk7AdeWRBgrRHw",
  authDomain: "adorahdebaa.firebaseapp.com",
  projectId: "adorahdebaa",
  storageBucket: "adorahdebaa.firebasestorage.app",
  messagingSenderId: "864472181612",
  appId: "1:864472181612:web:0c96f54dbc4d082fd2e149",
  measurementId: "G-234QM140XC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rsvpCollection = collection(db, "rsvps");

let totalGuests = 0;
let checkedInGuests = 0;

// Fetch and render RSVP data with live updates
function fetchAndRenderRSVPData(searchQuery = "") {
    const rsvpTableBody = document.getElementById("rsvp-table-body");
    const totalCountElem = document.getElementById("total-count");
    const checkedInCountElem = document.getElementById("checked-in-count");

    if (!rsvpTableBody) return;

    rsvpTableBody.innerHTML = ""; // Clear existing data

    try {
        const unsubscribe = onSnapshot(rsvpCollection, (querySnapshot) => {
            let totalGuests = 0;
            let checkedInGuests = 0;
            const rsvpList = [];

            querySnapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                const { firstName = "N/A", lastName = "N/A", checkedIn = false } = data;
                const fullName = `${firstName} ${lastName}`;

                // Filter the results based on the search query
                if (fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    rsvpList.push({
                        id: docSnapshot.id,
                        fullName,
                        checkedIn,
                    });
                }

                // Always count all guests, not just those in the search query
                totalGuests++;
                if (checkedIn) checkedInGuests++;
            });

            // Sort the list alphabetically by name
            rsvpList.sort((a, b) => a.fullName.localeCompare(b.fullName));

            rsvpList.forEach((guest, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2 max-w-min">${index + 1}</td>
                    <td class="border border-gray-300 px-4 py-2 font-semibold">${guest.fullName}</td>
                    <td class="border border-gray-300 px-4 py-2 flex flex-col gap-3 md:flex-row justify-center md:gap-6">
                        <button class="view-details bg-blue-500 text-white px-2 py-1 rounded" data-id="${guest.id}">
                            View Details
                        </button>
                        <button class="delete bg-red-500 text-white px-2 py-1 rounded" data-id="${guest.id}">
                            Delete
                        </button>
                        <button class="check-in bg-green-500 text-white px-2 py-1 rounded" data-id="${guest.id}" data-checked-in="${guest.checkedIn}">
                            ${guest.checkedIn ? "Checked In" : "Check In"}
                        </button>
                    </td>
                `;
                rsvpTableBody.appendChild(row);
            });

            // Update the count display
            totalCountElem.textContent = `Total Guests: ${totalGuests}`;
            checkedInCountElem.textContent = `Checked In: ${checkedInGuests} of ${totalGuests}`;

            // Attach event listeners to dynamically created buttons
            attachEventListeners();
        });

    } catch (error) {
        console.error("Error fetching RSVP data:", error);
    }
}



// Handle "Check In" button click
async function handleCheckIn(event) {
    const guestId = event.target.dataset.id;
    const button = event.target;
    const isCheckedIn = button.dataset.checkedIn === "true";
    const row = button.closest("tr"); // Get the <tr> element that contains the button

    try {
        const docRef = doc(db, "rsvps", guestId); // Direct reference to the 'rsvps' document

        // Toggle check-in status
        await setDoc(docRef, { checkedIn: !isCheckedIn }, { merge: true });

        // Update button appearance and text
        button.textContent = isCheckedIn ? "Check In" : "Checked In";
        button.dataset.checkedIn = (!isCheckedIn).toString();
        button.classList.toggle("bg-green-500", !isCheckedIn);
        button.classList.toggle("bg-gray-500", isCheckedIn);

        // Change the background color of the row based on check-in status
        if (!isCheckedIn) {
            row.style.backgroundColor = "#d4f7d4"; // Light green background for checked-in
        } else {
            row.style.backgroundColor = ""; // Reset the background color
        }

        // Update the counts for total and checked-in guests
        fetchAndRenderRSVPData(); // Re-fetch data to ensure counts are updated
    } catch (error) {
        console.error("Error updating check-in status:", error);
    }
}


// Display modal with guest details
function displayModal(data) {
  const modal = document.getElementById("details-modal");
  const modalContent = document.getElementById("modal-content");

  modalContent.innerHTML = `
    <p><strong>First Name:</strong> ${data.firstName || "N/A"}</p>
    <p><strong>Last Name:</strong> ${data.lastName || "N/A"}</p>
    <p><strong>Attendance:</strong> ${data.attendance || "N/A"}</p>
    <p><strong>Contact Method:</strong> ${data.contactMethod || "N/A"}</p>
    <p><strong>Contact Detail:</strong> ${data.contactDetail || "N/A"}</p>
    <p><strong>Partner Name:</strong> ${data.partnerName || "N/A"}</p>
  `;

  modal.style.display = "block";
}

// Update the modal close button event listener to hide the modal
document.getElementById("close-modal").addEventListener("click", () => {
    const modal = document.getElementById("details-modal");
    modal.style.display = "none";
});
async function handleViewDetails(event) {
    const guestId = event.target.dataset.id;

    try {
        // Fetch the guest data from Firestore
        const docRef = doc(db, "rsvps", guestId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            displayModal(data); // Call the modal display function
        } else {
            console.error("Guest not found");
        }
    } catch (error) {
        console.error("Error fetching guest details:", error);
    }
}

async function handleDeleteEntry(event) {
    const guestId = event.target.dataset.id;
  
    try {
      const docRef = doc(db, "rsvps", guestId);
      await deleteDoc(docRef);
      console.log("Document deleted successfully.");
      fetchAndRenderRSVPData(); // Refresh the table and count
    } catch (error) {
      console.error("Error deleting RSVP entry:", error);
    }
  }
  

// Attach event listeners to buttons after rendering the RSVP data
function attachEventListeners() {
    document.querySelectorAll(".view-details").forEach((button) =>
      button.addEventListener("click", handleViewDetails)
    );
    document.querySelectorAll(".delete").forEach((button) =>
      button.addEventListener("click", handleDeleteEntry)
    );
    document.querySelectorAll(".check-in").forEach((button) =>
      button.addEventListener("click", handleCheckIn)
    );
}

  // Handle search input
document.getElementById("search-input").addEventListener("input", (event) => {
    const searchQuery = event.target.value;
    fetchAndRenderRSVPData(searchQuery);
});
// Fetch and display RSVP data when the page loads
fetchAndRenderRSVPData();
