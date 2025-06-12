document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and Event Listeners ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    const themeSwitcher = document.getElementById('theme-switcher');

    // Highlight active navigation link
    navLinks.forEach(link => {
        // Handle root path ('') or 'index.html' for the Home link
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else if (linkPath.includes(currentPath) && currentPath !== '') {
            link.classList.add('active');
        }
    });

    // Theme Switcher Functionality
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        // Update icon based on theme
        const icon = themeSwitcher.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }

    // Load saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Toggle theme on button click
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Workout Logger Page Logic (workout-logger.html) ---
    if (currentPath === 'workout-logger.html') {
        const workoutForm = document.getElementById('workout-form');
        const exerciseNameInput = document.getElementById('exercise-name');
        const setsInput = document.getElementById('sets');
        const repsInput = document.getElementById('reps');
        const weightInput = document.getElementById('weight');
        const workoutTableBody = document.querySelector('#workout-table tbody');
        const noWorkoutsMessage = document.getElementById('no-workouts-message');
        const formMessageBox = document.getElementById('form-message');
        const workoutMessageBox = document.getElementById('workout-message-box');

        // Load workouts from localStorage
        let workouts = JSON.parse(localStorage.getItem('fitnessWorkouts')) || [];

        /**
         * Displays a message in a designated message box element.
         * @param {HTMLElement} messageBoxElement - The HTML element to display the message in.
         * @param {string} message - The message text.
         * @param {string} type - 'success' or 'error' for styling.
         */
        function displayMessage(messageBoxElement, message, type) {
            messageBoxElement.textContent = message;
            messageBoxElement.className = 'message-box'; // Reset classes
            messageBoxElement.classList.add(type === 'success' ? 'success-message' : 'error-message');
            messageBoxElement.style.display = 'block';
            setTimeout(() => {
                messageBoxElement.style.display = 'none';
                messageBoxElement.textContent = '';
                messageBoxElement.className = 'message-box'; // Clean up classes
            }, 3000); // Hide after 3 seconds
        }

        /**
         * Displays a message next to an input field.
         * @param {HTMLElement} inputElement - The input field.
         * @param {string} message - The error message.
         * @param {boolean} isError - True if it's an error, false to clear.
         */
        function displayInputMessage(inputElement, message, isError) {
            const errorDiv = document.getElementById(`${inputElement.id}-error`);
            if (isError) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                inputElement.closest('.form-group').classList.add('has-error');
            } else {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
                inputElement.closest('.form-group').classList.remove('has-error');
            }
        }

        /**
         * Clears all input field specific error messages.
         */
        function clearAllInputMessages() {
            const errorDivs = document.querySelectorAll('.error-message');
            errorDivs.forEach(div => {
                div.textContent = '';
                div.style.display = 'none';
            });
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('has-error');
            });
        }


        /**
         * Renders the workout list in the table.
         */
        function displayWorkouts() {
            workoutTableBody.innerHTML = ''; // Clear existing entries
            if (workouts.length === 0) {
                noWorkoutsMessage.style.display = 'block';
                workoutMessageBox.style.display = 'none'; // Ensure no message box if no workouts
                return;
            } else {
                noWorkoutsMessage.style.display = 'none';
            }

            // Loop through the workouts array to create table rows
            workouts.forEach((workout, index) => {
                const row = workoutTableBody.insertRow(); // Create a new table row
                row.innerHTML = `
                    <td>${workout.date}</td>
                    <td>${workout.exercise}</td>
                    <td>${workout.sets}</td>
                    <td>${workout.reps}</td>
                    <td>${workout.weight ? workout.weight + ' kg/lbs' : 'N/A'}</td>
                    <td>
                        <button class="remove-btn" data-index="${index}">Remove</button>
                    </td>
                `;
            });

            // Attach event listeners to new remove buttons
            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', removeWorkout);
            });
        }

        /**
         * Handles adding a new workout.
         * @param {Event} event - The form submit event.
         */
        function addWorkout(event) {
            event.preventDefault(); // Prevent default form submission

            clearAllInputMessages(); // Clear previous error messages

            let isValid = true;

            // Validate Exercise Name
            if (exerciseNameInput.value.trim() === '') {
                displayInputMessage(exerciseNameInput, 'Exercise name is required.', true);
                isValid = false;
            } else {
                displayInputMessage(exerciseNameInput, '', false);
            }

            // Validate Sets
            const sets = parseInt(setsInput.value);
            if (isNaN(sets) || sets <= 0) {
                displayInputMessage(setsInput, 'Sets must be a positive number.', true);
                isValid = false;
            } else {
                displayInputMessage(setsInput, '', false);
            }

            // Validate Reps
            const reps = parseInt(repsInput.value);
            if (isNaN(reps) || reps <= 0) {
                displayInputMessage(repsInput, 'Reps must be a positive number.', true);
                isValid = false;
            } else {
                displayInputMessage(repsInput, '', false);
            }

            if (!isValid) {
                displayMessage(formMessageBox, 'Please correct the errors in the form.', 'error');
                return; // Stop if validation fails
            }

            const newWorkout = {
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                exercise: exerciseNameInput.value.trim(),
                sets: sets,
                reps: reps,
                weight: parseFloat(weightInput.value) || 0 // Use 0 if weight is empty/invalid
            };

            workouts.push(newWorkout);
            localStorage.setItem('fitnessWorkouts', JSON.stringify(workouts)); // Save to localStorage

            displayWorkouts(); // Re-render the table
            workoutForm.reset(); // Clear the form fields
            displayMessage(formMessageBox, 'Workout added successfully!', 'success');
        }

        /**
         * Handles removing a workout entry.
         * @param {Event} event - The click event from the remove button.
         */
        function removeWorkout(event) {
            const indexToRemove = parseInt(event.target.dataset.index);
            if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < workouts.length) {
                // Using splice with an if/else check for demonstration of logic requirement
                if (workouts.length > 0) {
                    workouts.splice(indexToRemove, 1);
                    localStorage.setItem('fitnessWorkouts', JSON.stringify(workouts));
                    displayWorkouts(); // Re-render the table
                    displayMessage(workoutMessageBox, 'Workout removed successfully.', 'success');
                } else {
                    displayMessage(workoutMessageBox, 'No workouts to remove.', 'error');
                }
            }
        }

        // Add event listener for form submission
        workoutForm.addEventListener('submit', addWorkout);

        // Initial display of workouts when the page loads
        displayWorkouts();
    }

    // --- Progress Tracker Page Logic (progress-tracker.html) ---
    if (currentPath === 'progress-tracker.html') {
        const totalWorkoutsElement = document.getElementById('total-workouts');
        const totalWeightLiftedElement = document.getElementById('total-weight-lifted');
        const uniqueExercisesElement = document.getElementById('unique-exercises');
        const progressSummaryDiv = document.getElementById('progress-summary');
        const noProgressMessage = document.getElementById('no-progress-message');
        const progressDetailTableBody = document.querySelector('#progress-detail-table tbody');
        const noDetailedWorkoutsMessage = document.getElementById('no-detailed-workouts-message');
        const exerciseFilterInput = document.getElementById('exercise-filter');
        const sortBySelect = document.getElementById('sort-by');

        let workouts = JSON.parse(localStorage.getItem('fitnessWorkouts')) || [];

        /**
         * Updates the summary statistics on the progress tracker page.
         */
        function updateProgressSummary() {
            if (workouts.length === 0) {
                totalWorkoutsElement.textContent = '0';
                totalWeightLiftedElement.textContent = '0 kg';
                uniqueExercisesElement.textContent = '0';
                progressSummaryDiv.style.display = 'none';
                noProgressMessage.style.display = 'block';
            } else {
                progressSummaryDiv.style.display = 'grid';
                noProgressMessage.style.display = 'none';

                totalWorkoutsElement.textContent = workouts.length;

                let totalWeight = 0;
                let uniqueExercises = new Set(); // Using a Set to store unique exercise names

                // Loop through workouts to calculate totals and find unique exercises
                for (let i = 0; i < workouts.length; i++) {
                    const workout = workouts[i];
                    // Calculate estimated total weight lifted (sets * reps * weight)
                    totalWeight += (workout.sets * workout.reps * (workout.weight || 0));
                    uniqueExercises.add(workout.exercise.toLowerCase()); // Add lowercased exercise for uniqueness
                }

                totalWeightLiftedElement.textContent = `${totalWeight.toFixed(2)} kg/lbs`;
                uniqueExercisesElement.textContent = uniqueExercises.size;
            }
        }

        /**
         * Renders the detailed workout log table based on filters and sorting.
         * @param {Array<Object>} filteredAndSortedWorkouts - The list of workouts to display.
         */
        function displayDetailedWorkouts(filteredAndSortedWorkouts) {
            progressDetailTableBody.innerHTML = ''; // Clear existing entries

            if (filteredAndSortedWorkouts.length === 0) {
                noDetailedWorkoutsMessage.style.display = 'block';
                return;
            } else {
                noDetailedWorkoutsMessage.style.display = 'none';
            }

            // Loop through the filtered and sorted workouts
            filteredAndSortedWorkouts.forEach(workout => {
                const row = progressDetailTableBody.insertRow();
                row.innerHTML = `
                    <td>${workout.date}</td>
                    <td>${workout.exercise}</td>
                    <td>${workout.sets}</td>
                    <td>${workout.reps}</td>
                    <td>${workout.weight ? workout.weight + ' kg/lbs' : 'N/A'}</td>
                `;
            });
        }

        /**
         * Applies filtering and sorting to the workout data.
         */
        function applyFiltersAndSort() {
            let filteredWorkouts = [...workouts]; // Create a shallow copy to manipulate

            // Apply filter
            const filterText = exerciseFilterInput.value.toLowerCase().trim();
            if (filterText) {
                filteredWorkouts = filteredWorkouts.filter(workout =>
                    workout.exercise.toLowerCase().includes(filterText)
                );
            }

            // Apply sort
            const sortBy = sortBySelect.value;
            filteredWorkouts.sort((a, b) => {
                if (sortBy === 'date-desc') {
                    return new Date(b.date) - new Date(a.date);
                } else if (sortBy === 'date-asc') {
                    return new Date(a.date) - new Date(b.date);
                } else if (sortBy === 'exercise-asc') {
                    return a.exercise.localeCompare(b.exercise);
                } else if (sortBy === 'exercise-desc') {
                    return b.exercise.localeCompare(a.exercise);
                }
                return 0; // No change
            });

            displayDetailedWorkouts(filteredWorkouts);
        }

        // Add event listeners for filter and sort changes
        exerciseFilterInput.addEventListener('input', applyFiltersAndSort);
        sortBySelect.addEventListener('change', applyFiltersAndSort);

        // Initial calls when page loads
        updateProgressSummary();
        applyFiltersAndSort(); // Display detailed workouts initially
    }

    // --- Contact Page Logic (contact.html) ---
    if (currentPath === 'contact.html') {
        const contactForm = document.getElementById('contact-form');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const formSuccessMessage = document.getElementById('form-success-message');
        const formGeneralError = document.getElementById('form-general-error');

        /**
         * Displays/clears error messages for specific input fields.
         * @param {HTMLElement} inputElement - The input element to show/hide error for.
         * @param {string} message - The error message text.
         * @param {boolean} isError - True to show error, false to clear.
         */
        function displayContactInputError(inputElement, message, isError) {
            const errorDiv = document.getElementById(`${inputElement.id}-error`);
            if (isError) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                inputElement.setAttribute('aria-invalid', 'true');
                inputElement.closest('.form-group').classList.add('has-error');
            } else {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
                inputElement.setAttribute('aria-invalid', 'false');
                inputElement.closest('.form-group').classList.remove('has-error');
            }
        }

        /**
         * Clears all general error messages.
         */
        function clearGeneralMessages() {
            formSuccessMessage.style.display = 'none';
            formSuccessMessage.textContent = '';
            formGeneralError.style.display = 'none';
            formGeneralError.textContent = '';
        }

        /**
         * Validates the contact form.
         * @param {Event} event - The form submit event.
         */
        function validateContactForm(event) {
            event.preventDefault(); // Prevent default form submission

            clearGeneralMessages(); // Clear previous general messages
            // Clear all individual input errors
            displayContactInputError(nameInput, '', false);
            displayContactInputError(emailInput, '', false);
            displayContactInputError(messageInput, '', false);


            let isValid = true;
            let errors = [];

            // Validate Name
            if (nameInput.value.trim() === '') {
                displayContactInputError(nameInput, 'Name is required.', true);
                errors.push('Name is required.');
                isValid = false;
            }

            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
            if (emailInput.value.trim() === '') {
                displayContactInputError(emailInput, 'Email is required.', true);
                errors.push('Email is required.');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                displayContactInputError(emailInput, 'Please enter a valid email address.', true);
                errors.push('Invalid email format.');
                isValid = false;
            }

            // Validate Message
            if (messageInput.value.trim() === '') {
                displayContactInputError(messageInput, 'Message is required.', true);
                errors.push('Message is required.');
                isValid = false;
            }

            // If any validation failed, show a general error message
            if (!isValid) {
                formGeneralError.textContent = 'Please fix the errors above to submit the form.';
                formGeneralError.style.display = 'block';
            } else {
                // Simulate form submission
                formSuccessMessage.textContent = 'Thank you for your feedback! Your message has been sent.';
                formSuccessMessage.style.display = 'block';
                contactForm.reset(); // Clear form fields

                // Optional: Clear success message after some time
                setTimeout(() => {
                    clearGeneralMessages();
                }, 5000);
            }
        }

        // Add event listener for contact form submission
        contactForm.addEventListener('submit', validateContactForm);
    }
});
