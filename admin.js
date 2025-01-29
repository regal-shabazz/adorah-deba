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
let guests = [];

document.addEventListener("DOMContentLoaded", async () => {
    const guestListTable = document.getElementById("guest-list");
    const totalCountElem = document.getElementById("total-count");
    const withPartnerCountElem = document.getElementById("with-total-count");
    const withoutPartnerCountElem = document.getElementById("without-total-count");
    const searchInput = document.getElementById("search-input");

    // Fetch RSVP data from Firestore
    async function fetchGuests() {
        const snapshot = await getDocs(collection(db, "rsvps"));
        guests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        sortAndRenderGuestList();
    }

    // Sort guests alphabetically by name
    function sortGuests() {
        guests.sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }

    // Render Guest List
    function renderGuestList(filteredGuests = guests) {
        guestListTable.innerHTML = ""; // Clear existing rows
        let totalGuestCount = 0;
        let withPartnerTotal = 0;
        let withoutPartnerTotal = 0;
        
        filteredGuests.forEach((guest, index) => {
            const tr = document.createElement("tr");
            tr.classList.add("border", "border-yellow-900");

            // Calculate total guest count including partners
            const guestCount = guest.attendance == 'with partner' ? 2 : 1;
            totalGuestCount += guestCount;

            // Calculate guest count with and without partners  
            if (guest.attendance == 'with partner') {
                withPartnerTotal += 1;
            } else {
                withoutPartnerTotal += 1;
            }

            tr.innerHTML = `
                <td class="border border-yellow-900 px-4 py-2 text-xs">${index + 1}</td>
                <td class="border border-yellow-900 px-4 py-2 text-xs font-bold">${guest.firstName} ${guest.lastName}</td>
                <td class="border border-yellow-900 px-4 py-2 text-xs">${guest.attendance}</td>
                <td class="hidden md:table-cell border border-yellow-900 px-4 py-2 text-xs">
                    <span class="${guest.contactMethod === 'whatsapp' ? 'bg-green-700' : 'bg-red-600'} text-white p-1 rounded">${guest.contactMethod}</span>
                    : <span class="font-semibold">${guest.contactDetail}</span>
                </td>
                <td class="px-4 py-2 flex justify-around">
                    <button class="delete-btn bg-red-600 text-white px-2 py-1 rounded text-xs" data-id="${guest.id}">Delete</button>
                </td>
            `;
            guestListTable.appendChild(tr);
        });

        // Update total guest count including partners
        totalCountElem.textContent = `Total Guests (Partners included): ${totalGuestCount}
       `;
        withPartnerCountElem.textContent = `Guests attending with partner: ${withPartnerTotal}
       `;
        withoutPartnerCountElem.textContent = `Guests attending alone: ${withoutPartnerTotal}
       `;

        addActionListeners();
    }

    // Sort and render the guest list
    function sortAndRenderGuestList() {
        sortGuests();
        renderGuestList();
    }

    // Add Action Listeners to buttons
    function addActionListeners() {
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const guestId = e.target.dataset.id;
                await deleteDoc(doc(db, "rsvps", guestId));
                guests = guests.filter((guest) => guest.id !== guestId);
                sortAndRenderGuestList();
            });
        });
    }

    // Filter guest list based on search input
    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredGuests = guests.filter((guest) => {
            const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
            return fullName.includes(searchQuery);
        });
        renderGuestList(filteredGuests);
    });

    // Initial fetch and render
    fetchGuests();
});


// Function to download the guest list as CSV
function downloadCSV() {
    if (guests.length === 0) {
        alert("No guests to download!");
        return;
    }

    // Prepare CSV headers and rows
    const headers = ["First Name", "Last Name", "Attending", "Contact Method", "Contact Detail"];
    const rows = guests.map((guest) => [
        guest.firstName,
        guest.lastName,
        guest.attendance,
        guest.contactMethod,
        guest.contactDetail,
    ]);

    // Combine headers and rows into a single CSV string
    const csvContent = [headers, ...rows]
        .map((row) => row.map((value) => `"${value}"`).join(","))
        .join("\n");

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest_list.csv"; // File name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Attach event listener to the download button
document.getElementById("download-list").addEventListener("click", downloadCSV);