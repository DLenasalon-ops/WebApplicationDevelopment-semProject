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
/* ──────────────────────────────────────────────────────────────
   FEATURE 1: RIDE FILTER  (attractions.html)
   ──────────────────────────────────────────────────────────────

   WHAT IT DOES:
   When a user clicks a filter button like "Mild" or "Water",
   the page instantly hides all ride cards that don't match,
   and shows only the ones that do.

   HOW IT WORKS:
   1. Each filter BUTTON has two data attributes:
        data-group="thrill"    → which filter group (thrill or type)
        data-value="mild"      → what value to filter for

   2. Each ride CARD div has two data attributes:
        data-thrill="mild"     → the ride's thrill level
        data-type="family"     → the ride's type

   3. When a button is clicked:
      a. That button becomes "active" in its group
      b. JS reads the selected value for BOTH groups
      c. JS loops through every ride card
      d. If the card matches BOTH filters → show it
      e. If it doesn't match → hide it (add class "hidden")

   4. If no cards match at all, a "no results" message appears
   ────────────────────────────────────────────────────────────── */

function RideFilter() {

  // Find all filter buttons on the page
  var filterButtons = document.querySelectorAll('.filter-btn');

  // If there are no filter buttons, this isn't the attractions page — exit
  if (filterButtons.length === 0) return;

  // Find all ride cards
  var rideCards = document.querySelectorAll('.ride-card');

  // Track the currently selected filter for each group
  // "all" means no filter is active (show everything)
  var selectedThrill = 'all';
  var selectedType   = 'all';

  // Add a click event listener to EVERY filter button
  filterButtons.forEach(function(btn) {

    btn.addEventListener('click', function() {

      // Read which group and value this button represents
      var group = btn.getAttribute('data-group');
      var value = btn.getAttribute('data-value');

      // ── Step 1: Update the "active" button in this group ──
      // Remove "active" from ALL buttons in the same group
      var groupButtons = document.querySelectorAll('.filter-btn[data-group="' + group + '"]');
      groupButtons.forEach(function(b) {
        b.classList.remove('active');
      });

      // Add "active" to the clicked button
      btn.classList.add('active');

      // ── Step 2: Update our tracking variable ──
      if (group === 'thrill') selectedThrill = value;
      if (group === 'type')   selectedType   = value;

      // ── Step 3: Show or hide each ride card ──
      var visibleCount = 0;

      rideCards.forEach(function(card) {

        // Read this card's thrill level and type from its data attributes
        var cardThrill = card.getAttribute('data-thrill');
        var cardType   = card.getAttribute('data-type');

        // Check if this card matches BOTH selected filters
        var matchesThrill = (selectedThrill === 'all' || cardThrill === selectedThrill);
        var matchesType   = (selectedType   === 'all' || cardType   === selectedType);

        if (matchesThrill && matchesType) {
          // Card matches — make sure it's visible
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          // Card doesn't match — hide it
          card.classList.add('hidden');
        }

      });

      // ── Step 4: Show "no results" if everything is hidden ──
      var noResults = document.getElementById('no-results');
      if (noResults) {
        if (visibleCount === 0) {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }
      }

    }); // end click listener

  }); // end forEach on buttons

}

/* ============================================================
   FEATURE 2: TICKET PRICE CALCULATOR
   Page: tickets.html

   HOW IT WORKS:
   - The user enters numbers for adults, children, seniors
   - They can also tick add-on checkboxes (Fast Pass, Dining)
   - Every time any input changes, we recalculate the total
   - The total is shown live without reloading the page
   ============================================================ */

/* ──────────────────────────────────────────────────────────────
   FEATURE 2: AGE-BASED TICKET CALCULATOR  (tickets.html)
   ──────────────────────────────────────────────────────────────

   HOW IT WORKS:
   ─────────────────────────────────────────────────────────────
   STEP 1: User enters how many people are in their group
   STEP 2: JS creates that many age input fields automatically
   STEP 3: User types each person's age
   STEP 4: JS automatically categorises each age:
            - 0 to 2:   FREE
            - 3 to 17:  Child  (KSh 800)
            - 18 to 59: Adult  (KSh 1,200)
            - 60+:      Senior (KSh 600)
   STEP 5: Total updates live as ages are entered

   VALIDATION RULES:
   ─────────────────────────────────────────────────────────────
   - Group size must be between 0 and 20
   - Each age must be a number between 0 and 120
   - Negative numbers are rejected
   - Empty fields show "—" (not counted yet)
   - Invalid ages show a red border + error message
   - If ANY age is invalid, the total resets to KSh 0
   ────────────────────────────────────────────────────────────── */

function TicketCalc() {

  // Find the calculator on the page. If not present, this isn't tickets.html — exit.
  var calcForm = document.getElementById('ticketCalculator');
  if (!calcForm) return;

  // ──────────────────────────────────────────────
  // PRICE CONSTANTS (KSh)
  // ──────────────────────────────────────────────
  var PRICES = {
    child:    800,    // ages 3 to 17
    adult:   1200,    // ages 18 to 59
    senior:   600,    // age 60+
    fastpass: 500,    // optional add-on, per person
    dining:   800     // optional add-on, per person
  };

  // Maximum number of people allowed in one booking
  var MAX_GROUP_SIZE = 20;

  // Grab references to the two key elements we'll work with
  var groupSizeInput = document.getElementById('groupSize');
  var ageInputsBox   = document.getElementById('ageInputs');


  // ──────────────────────────────────────────────
  // FUNCTION 1: Build age input fields
  // ──────────────────────────────────────────────
  // Runs when the user changes the "group size" number.
  // It clears any old age fields and creates new ones.
  function buildAgeInputs() {

    var size = parseInt(groupSizeInput.value) || 0;

    // Clear any previous error on the group size field
    clearError(groupSizeInput);

    // VALIDATION: group size cannot be negative
    if (size < 0) {
      showError(groupSizeInput, 'Group size cannot be negative.');
      ageInputsBox.innerHTML = '';
      updateTotal();
      return;
    }

    // VALIDATION: group size cannot exceed the maximum
    if (size > MAX_GROUP_SIZE) {
      showError(groupSizeInput,
        'Maximum ' + MAX_GROUP_SIZE + ' people per booking. ' +
        'For larger groups, please use the Contact page.');
      ageInputsBox.innerHTML = '';
      updateTotal();
      return;
    }

    // Build the HTML for the age input fields
    // We use string concatenation here so it's easy to read
    var html = '';
    if (size > 0) {
      html += '<p class="fw-bold mb-2 mt-3">Enter each person\'s age:</p>';

      // Loop from 1 to size — create one input row per person
      for (var i = 1; i <= size; i++) {
        html += '<div class="mb-2">';
        html +=   '<div class="input-group">';
        html +=     '<span class="input-group-text" style="min-width:90px;">Person ' + i + '</span>';
        html +=     '<input type="number" class="form-control age-input" ';
        html +=            'data-person="' + i + '" min="0" max="120" placeholder="Age">';
        html +=     '<span class="input-group-text ticket-type" id="ticketType' + i + '">—</span>';
        html +=   '</div>';
        html +=   '<div class="invalid-feedback person-error" id="error' + i + '"></div>';
        html += '</div>';
      }
    }

    // Insert the new HTML into the page
    ageInputsBox.innerHTML = html;

    // Attach an "input" event listener to each age field
    // so the total updates as soon as the user types
    var ageInputs = document.querySelectorAll('.age-input');
    ageInputs.forEach(function(input) {
      input.addEventListener('input', updateTotal);
    });

    // Recalculate the total (everything is empty for now, but call it anyway)
    updateTotal();
  }


  // ──────────────────────────────────────────────
  // FUNCTION 2: Categorise an age into a ticket type
  // ──────────────────────────────────────────────
  // Given an age number, return an object describing the ticket
  function categorise(age) {
    if (age < 3) {
      return { type: 'free',   label: 'Free (under 3)', price: 0 };
    }
    if (age <= 17) {
      return { type: 'child',  label: 'Child',          price: PRICES.child };
    }
    if (age <= 59) {
      return { type: 'adult',  label: 'Adult',          price: PRICES.adult };
    }
    return     { type: 'senior', label: 'Senior',         price: PRICES.senior };
  }


  // ──────────────────────────────────────────────
  // FUNCTION 3: Calculate the total and update display
  // ──────────────────────────────────────────────
  // Runs every time any age input or checkbox changes
  function updateTotal() {

    // Get all the age input fields currently on the page
    var ageInputs = document.querySelectorAll('.age-input');

    // Track how many of each ticket type we have
    var counts = { free: 0, child: 0, adult: 0, senior: 0 };
    var subtotal = 0;       // running total of base ticket prices
    var totalPeople = 0;    // total people (excluding empty fields)
    var hasError = false;   // becomes true if any age is invalid

    // Loop through every age input
    ageInputs.forEach(function(input) {
      var personNum  = input.getAttribute('data-person');
      var ageStr     = input.value;

      // Get the badge that shows the ticket type and the error message div
      var typeBadge  = document.getElementById('ticketType' + personNum);
      var errorDiv   = document.getElementById('error' + personNum);

      // Reset any previous error state on this field
      input.classList.remove('is-invalid');
      if (errorDiv) errorDiv.textContent = '';

      // Empty field — skip it, but no error
      if (ageStr === '') {
        if (typeBadge) {
          typeBadge.textContent = '—';
          typeBadge.style.background = '';
        }
        return;
      }

      // Convert the text to a number
      var age = parseInt(ageStr);

      // VALIDATION: age must be a valid number between 0 and 120
      if (isNaN(age) || age < 0 || age > 120) {
        input.classList.add('is-invalid');
        if (errorDiv) errorDiv.textContent = 'Please enter a valid age (0–120).';
        if (typeBadge) {
          typeBadge.textContent = 'Invalid';
          typeBadge.style.background = '#fee2e2';
        }
        hasError = true;
        return;
      }

      // VALID AGE — categorise it
      var cat = categorise(age);

      // Add to the count of this ticket type
      counts[cat.type]++;

      // Add the price to the subtotal
      subtotal += cat.price;

      // Count this person
      totalPeople++;

      // Show the ticket type label next to the age input
      if (typeBadge) {
        typeBadge.textContent = cat.label;

        // Colour-code the badge by ticket type for visual feedback
        if (cat.type === 'free')   typeBadge.style.background = '#d1fae5';
        if (cat.type === 'child')  typeBadge.style.background = '#dbeafe';
        if (cat.type === 'adult')  typeBadge.style.background = '#fed7aa';
        if (cat.type === 'senior') typeBadge.style.background = '#e0e7ff';
      }
    });

    // Read the optional add-on checkboxes
    var fastPass = document.getElementById('addFastPass').checked;
    var dining   = document.getElementById('addDining').checked;

    // Calculate the final total (subtotal + any add-ons)
    var total = subtotal;
    if (fastPass) total += totalPeople * PRICES.fastpass;
    if (dining)   total += totalPeople * PRICES.dining;

    // If ANY age was invalid, refuse to show a total
    if (hasError) {
      document.getElementById('totalAmount').textContent = 'KSh 0';
      document.getElementById('priceBreakdown').innerHTML =
        '<p class="text-danger text-center mb-0">' +
        '<strong>Please correct the invalid ages above.</strong></p>';
      return;
    }

    // Build the breakdown HTML (line-by-line cost details)
    var breakdown = '';
    if (counts.adult  > 0) breakdown += makeRow(counts.adult  + ' Adult(s)', counts.adult  * PRICES.adult);
    if (counts.child  > 0) breakdown += makeRow(counts.child  + ' Child(ren) (3–17)', counts.child  * PRICES.child);
    if (counts.senior > 0) breakdown += makeRow(counts.senior + ' Senior(s) (60+)',   counts.senior * PRICES.senior);
    if (counts.free   > 0) breakdown += makeRow(counts.free   + ' Free (under 3)',    0);
    if (fastPass && totalPeople > 0) {
      breakdown += makeRow('Fast Pass (' + totalPeople + ' person)', totalPeople * PRICES.fastpass);
    }
    if (dining && totalPeople > 0) {
      breakdown += makeRow('Dining Package (' + totalPeople + ' person)', totalPeople * PRICES.dining);
    }

    // If nothing has been entered yet, show a helpful prompt
    if (breakdown === '') {
      breakdown = '<p class="text-muted text-center mb-0">Enter ages above to see your total.</p>';
    }

    // Update the display
    document.getElementById('priceBreakdown').innerHTML = breakdown;
    document.getElementById('totalAmount').textContent  = 'KSh ' + total.toLocaleString();
  }


  // ──────────────────────────────────────────────
  // HELPER: Build one row of the price breakdown
  // ──────────────────────────────────────────────
  function makeRow(label, amount) {
    return '<div class="d-flex justify-content-between py-1 border-bottom">' +
             '<span>' + label + '</span>' +
             '<strong>KSh ' + amount.toLocaleString() + '</strong>' +
           '</div>';
  }


  // ──────────────────────────────────────────────
  // HELPER: Show an error message on a field
  // ──────────────────────────────────────────────
  function showError(field, message) {
    field.classList.add('is-invalid');
    var errorDiv = field.parentElement.querySelector('.invalid-feedback');
    if (errorDiv) errorDiv.textContent = message;
  }


  // ──────────────────────────────────────────────
  // HELPER: Clear any error from a field
  // ──────────────────────────────────────────────
  function clearError(field) {
    field.classList.remove('is-invalid');
    var errorDiv = field.parentElement.querySelector('.invalid-feedback');
    if (errorDiv) errorDiv.textContent = '';
  }


  // ──────────────────────────────────────────────
  // ATTACH EVENT LISTENERS
  // ──────────────────────────────────────────────
  // When group size changes, rebuild the age inputs
  groupSizeInput.addEventListener('input', buildAgeInputs);

  // When checkboxes are clicked, recalculate the total
  document.getElementById('addFastPass').addEventListener('change', updateTotal);
  document.getElementById('addDining').addEventListener('change', updateTotal);

  // Run once at page load to set up the initial state
  buildAgeInputs();
}


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

function ContactForm() {

  // Check if the form exists on this page
  const form = document.getElementById("contactForm");
  if (!form) return; // Stop if we're not on contactForm.html

  // Listen for the form submit event
  form.addEventListener('submit', function(e) {

    // IMPORTANT: Stop the page from reloading (default form behaviour)
    e.preventDefault();
    console.log("Form submit intercepted!");

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
    } else if (nameField.value.trim().length < 8 ) {
      // Too short 
      showError(nameField, 'Name must be at least 3 characters long.');
      allValid = false;
    }
    else if(nameField.value.trim().length>25){
      //too long 
      showError(nameField, 'Name must be less than 15 characters long.');
      allValid=false;
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
/* ──────────────────────────────────────────────────────────────
   FEATURE 4: EVENT COUNTDOWN TIMER  (events.html)
   ──────────────────────────────────────────────────────────────

   HOW IT WORKS:
   1. We define the next upcoming event date
   2. Every second, JS calculates the time remaining
   3. It splits the difference into days, hours, minutes, seconds
   4. It updates the four number displays on the page
   5. When the event arrives, it shows "Event is LIVE!"
   ────────────────────────────────────────────────────────────── */

function initCountdown() {

  // Only run on the events page
  var timerElement = document.getElementById('countdownTimer');
  if (!timerElement) return;

  // Set the next event date (change this to your actual next event)
  // Format: Year, Month (0-based, so 5 = June), Day, Hour, Minute
  var nextEvent = new Date(2026, 6, 4, 19, 0, 0);
var eventName = 'Night Parade Spectacular';

  // Update the event name display
  var nameDisplay = document.getElementById('countdownName');
  if (nameDisplay) nameDisplay.textContent = eventName;

  function updateTimer() {

    // Get the current time
    var now = new Date();

    // Calculate the difference in milliseconds
    var diff = nextEvent - now;

    // If the event has passed, show "LIVE" message
    if (diff <= 0) {
      document.getElementById('countDays').textContent  = '00';
      document.getElementById('countHours').textContent = '00';
      document.getElementById('countMins').textContent  = '00';
      document.getElementById('countSecs').textContent  = '00';
      if (nameDisplay) nameDisplay.textContent = eventName + ' is LIVE NOW!';
      return;
    }

    // Convert milliseconds to days, hours, minutes, seconds
    var days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins  = Math.floor((diff / (1000 * 60)) % 60);
    var secs  = Math.floor((diff / 1000) % 60);

    // Update the display (padStart adds a leading 0 so "5" becomes "05")
    document.getElementById('countDays').textContent  = String(days).padStart(2, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('countSecs').textContent  = String(secs).padStart(2, '0');
  }

  // Run immediately, then every second
  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ============================================================
   START EVERYTHING
   DOMContentLoaded fires when the page HTML has fully loaded.
   We run all our functions here so the HTML elements exist first.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  highlightCurrentPage();  // Works on all pages
  RideFilter();        // Only does something on attractions.html
  TicketCalc();  // Only does something on tickets.html
  ContactForm();       // Only does something on contactForm.html
  initCountdown(); 
});
