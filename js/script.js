/*
  SAMBFUN PARK - script.js
  -------------------------------------------------------
  This file contains THREE interactive features:
  1. Ride Filter      (used on attractions.html)
  2. Ticket Calculator (used on tickets.html)
  3. Form Validation  (used on contactForm.html)

  HOW JAVASCRIPT WORKS WITH HTML:
  - JavaScript reads HTML elements using document.getElementById('id')
  - It listens for user actions (clicking, typing) with addEventListener
  - It changes what is displayed by modifying classes or text content
  -------------------------------------------------------
*/


/* ============================================================
   FEATURE 1: RIDE FILTER
   Page: attractions.html

   HOW IT WORKS:
   - Each ride card has two data attributes: data-thrill and data-type
     e.g. <div class="ride-card" data-thrill="extreme" data-type="coaster">
   - Each filter button has data-group and data-value
     e.g. <button class="filter-btn" data-group="thrill" data-value="extreme">
   - When a button is clicked, JS hides cards that don't match
   - Cards are hidden using the CSS class .hidden (display: none)
   ============================================================ */

// This function runs only if filter buttons exist on the page
function initRideFilter() {

  // Get all filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');

  // If there are no filter buttons, stop here (we're not on attractions.html)
  if (filterButtons.length === 0) return;

  // Get all ride cards
  const rideCards = document.querySelectorAll('.ride-card');

  // Track which filters are currently active
  let selectedThrill = 'all'; // 'all' means show everything
  let selectedType   = 'all';

  // Loop through each filter button and add a click listener
  filterButtons.forEach(function(button) {

    button.addEventListener('click', function() {

      // Find out which group this button belongs to (thrill or type)
      const group = button.getAttribute('data-group');
      // Find out what value this button filters for
      const value = button.getAttribute('data-value');

      // Remove 'active' from all buttons in the same group
      document.querySelectorAll('.filter-btn[data-group="' + group + '"]').forEach(function(btn) {
        btn.classList.remove('active');
      });

      // Mark THIS button as active
      button.classList.add('active');

      // Update our tracking variables
      if (group === 'thrill') selectedThrill = value;
      if (group === 'type')   selectedType   = value;

      // Now show/hide each ride card based on the selected filters
      let visibleCount = 0;

      rideCards.forEach(function(card) {

        // Read this card's thrill level and type from its data attributes
        const cardThrill = card.getAttribute('data-thrill');
        const cardType   = card.getAttribute('data-type');

        // Check if this card matches both active filters
        const thrillMatch = (selectedThrill === 'all' || cardThrill === selectedThrill);
        const typeMatch   = (selectedType   === 'all' || cardType   === selectedType);

        if (thrillMatch && typeMatch) {
          // Show this card
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          // Hide this card
          card.classList.add('hidden');
        }
      });

      // If no cards are visible, show the "no results" message
      const noResults = document.getElementById('no-results');
      if (noResults) {
        if (visibleCount === 0) {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }
      }

    }); // end click event
  }); // end forEach
} // end initRideFilter


/* ============================================================
   FEATURE 2: TICKET PRICE CALCULATOR
   Page: tickets.html

   HOW IT WORKS:
   - The user enters numbers for adults, children, seniors
   - They can also tick add-on checkboxes (Fast Pass, Dining)
   - Every time any input changes, we recalculate the total
   - The total is shown live without reloading the page
   ============================================================ */

function initTicketCalculator() {

  // Check if the calculator exists on this page
  const calculator = document.getElementById('ticketCalculator');
  if (!calculator) return; // Stop if we're not on tickets.html

  // Price list (in Kenyan Shillings)
  const ADULT_PRICE    = 1200;
  const CHILD_PRICE    = 800;
  const SENIOR_PRICE   = 600;
  const FASTPASS_PRICE = 500; // per person add-on
  const DINING_PRICE   = 800; // per person add-on

  // This function runs every time an input changes
  function calculateTotal() {

    // Read number inputs (|| 0 means "use 0 if the field is empty")
    const numAdults  = parseInt(document.getElementById('numAdults').value)   || 0;
    const numChildren= parseInt(document.getElementById('numChildren').value) || 0;
    const numSeniors = parseInt(document.getElementById('numSeniors').value)  || 0;

    // Read checkboxes (.checked is true or false)
    const wantsFastPass = document.getElementById('addFastPass').checked;
    const wantsDining   = document.getElementById('addDining').checked;

    // Total number of people (for calculating add-ons per person)
    const totalPeople = numAdults + numChildren + numSeniors;

    // Calculate base ticket cost
    let total = (numAdults   * ADULT_PRICE)
              + (numChildren * CHILD_PRICE)
              + (numSeniors  * SENIOR_PRICE);

    // Add optional extras if ticked
    if (wantsFastPass) total += totalPeople * FASTPASS_PRICE;
    if (wantsDining)   total += totalPeople * DINING_PRICE;

    // Update the total shown on screen
    // toLocaleString() formats numbers with commas: 1200 → "1,200"
    document.getElementById('totalAmount').textContent = 'KSh ' + total.toLocaleString();

    // Build a line-by-line breakdown
    let breakdown = '';

    if (numAdults > 0) {
      breakdown += '<div class="d-flex justify-content-between py-1 border-bottom">'
                 + '<span>' + numAdults + ' Adult(s)</span>'
                 + '<span>KSh ' + (numAdults * ADULT_PRICE).toLocaleString() + '</span>'
                 + '</div>';
    }

    if (numChildren > 0) {
      breakdown += '<div class="d-flex justify-content-between py-1 border-bottom">'
                 + '<span>' + numChildren + ' Child(ren)</span>'
                 + '<span>KSh ' + (numChildren * CHILD_PRICE).toLocaleString() + '</span>'
                 + '</div>';
    }

    if (numSeniors > 0) {
      breakdown += '<div class="d-flex justify-content-between py-1 border-bottom">'
                 + '<span>' + numSeniors + ' Senior(s)</span>'
                 + '<span>KSh ' + (numSeniors * SENIOR_PRICE).toLocaleString() + '</span>'
                 + '</div>';
    }

    if (wantsFastPass && totalPeople > 0) {
      breakdown += '<div class="d-flex justify-content-between py-1 border-bottom text-warning">'
                 + '<span>Fast Pass (' + totalPeople + ' person)</span>'
                 + '<span>KSh ' + (totalPeople * FASTPASS_PRICE).toLocaleString() + '</span>'
                 + '</div>';
    }

    if (wantsDining && totalPeople > 0) {
      breakdown += '<div class="d-flex justify-content-between py-1 border-bottom text-warning">'
                 + '<span>Dining Package (' + totalPeople + ' person)</span>'
                 + '<span>KSh ' + (totalPeople * DINING_PRICE).toLocaleString() + '</span>'
                 + '</div>';
    }

    // If nothing entered yet, show a placeholder message
    if (breakdown === '') {
      breakdown = '<p class="text-muted text-center mb-0">Enter guest numbers above to see breakdown.</p>';
    }

    document.getElementById('priceBreakdown').innerHTML = breakdown;
  }

  // Run calculateTotal whenever ANY input inside the calculator changes
  calculator.addEventListener('input',  calculateTotal);
  calculator.addEventListener('change', calculateTotal);

  // Run once on page load so the display starts correctly
  calculateTotal();

} // end initTicketCalculator


/* ============================================================
   FEATURE 3: CONTACT FORM VALIDATION
   Page: contactForm.html

   HOW IT WORKS:
   - The form has novalidate so the browser doesn't auto-validate
   - When the user clicks Submit, JS intercepts with e.preventDefault()
   - Each field is checked against rules
   - If a rule fails: .is-invalid class added (Bootstrap shows red border)
     and the .invalid-feedback div below shows an error message
   - If all fields pass: the form hides and a success message appears
   ============================================================ */

function initContactForm() {

  // Check if the form exists on this page
  const form = document.getElementById('contactForm');
  if (!form) return; // Stop if we're not on contactForm.html

  // Listen for the form submit event
  form.addEventListener('submit', function(e) {

    // IMPORTANT: Stop the page from reloading (default form behaviour)
    e.preventDefault();

    // Track whether all fields pass validation
    let allValid = true;

    // Clear any previous error messages before re-checking
    form.querySelectorAll('.is-invalid').forEach(function(field) {
      field.classList.remove('is-invalid');
    });
    form.querySelectorAll('.invalid-feedback').forEach(function(msg) {
      msg.textContent = '';
    });

    // ------ VALIDATE: Full Name ------
    const nameField = document.getElementById('fullName');
    if (nameField.value.trim() === '') {
      // Field is empty
      showError(nameField, 'Please enter your full name.');
      allValid = false;
    } else if (nameField.value.trim().length < 3) {
      // Too short
      showError(nameField, 'Name must be at least 3 characters long.');
      allValid = false;
    }

    // ------ VALIDATE: Email ------
    const emailField = document.getElementById('emailAddr');
    // Regular expression that checks for a valid email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailField.value.trim() === '') {
      showError(emailField, 'Please enter your email address.');
      allValid = false;
    } else if (!emailPattern.test(emailField.value.trim())) {
      showError(emailField, 'Please enter a valid email (e.g. name@example.com).');
      allValid = false;
    }

    // ------ VALIDATE: Phone (optional field) ------
    const phoneField = document.getElementById('phoneNum');
    if (phoneField.value.trim() !== '') {
      // Only validate if the user actually typed something
      const phonePattern = /^[\+]?[\d\s\-\(\)]{7,15}$/;
      if (!phonePattern.test(phoneField.value.trim())) {
        showError(phoneField, 'Please enter a valid phone number.');
        allValid = false;
      }
    }

    // ------ VALIDATE: Subject dropdown ------
    const subjectField = document.getElementById('subject');
    if (subjectField.value === '') {
      showError(subjectField, 'Please select a subject from the list.');
      allValid = false;
    }

    // ------ VALIDATE: Message ------
    const messageField = document.getElementById('message');
    if (messageField.value.trim() === '') {
      showError(messageField, 'Please write a message.');
      allValid = false;
    } else if (messageField.value.trim().length < 20) {
      showError(messageField, 'Your message must be at least 20 characters long.');
      allValid = false;
    }

    // ------ IF ALL VALID: Show success ------
    if (allValid) {
      // Hide the form
      form.style.display = 'none';
      // Show the success message
      document.getElementById('successMsg').style.display = 'block';
    }

  }); // end submit listener

  // Helper function: marks a field as invalid and shows an error message
  function showError(field, message) {
    field.classList.add('is-invalid');         // Bootstrap adds red border
    // The error text goes in the .invalid-feedback div right below the field
    const errorDiv = field.parentElement.querySelector('.invalid-feedback');
    if (errorDiv) {
      errorDiv.textContent = message;
    }
  }

} // end initContactForm


/* ============================================================
   ACTIVE NAV LINK
   Automatically highlights the current page in the navbar.
   Works on ALL pages.
   ============================================================ */
function highlightCurrentPage() {

  // Get the current file name from the URL
  // e.g. "http://localhost/about.html" → "about.html"
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Loop through all nav links
  document.querySelectorAll('.nav-link').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');   // Highlight this link
    } else {
      link.classList.remove('active'); // Remove highlight from others
    }
  });
}


/* ============================================================
   START EVERYTHING
   DOMContentLoaded fires when the page HTML has fully loaded.
   We run all our functions here so the HTML elements exist first.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  highlightCurrentPage();  // Works on all pages
  initRideFilter();        // Only does something on attractions.html
  initTicketCalculator();  // Only does something on tickets.html
  initContactForm();       // Only does something on contactForm.html
});
