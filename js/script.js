document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and Initializations ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const modeToggle = document.getElementById('modeToggle');
    const body = document.body;
    const currentYearSpan = document.getElementById('currentYear');
    const lastModifiedSpan = document.getElementById('lastModified');

    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Set last modified date in footer
    if (lastModifiedSpan) {
        lastModifiedSpan.textContent = document.lastModified;
    }

    // --- Mobile Menu Toggle ---
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', isOpen);
            // Optional: Add/remove overflow-hidden to body to prevent scrolling when menu is open
            body.classList.toggle('overflow-hidden', isOpen);
        });

        // Close menu on click outside or on link click (for better UX)
        mobileMenu.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' || event.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('overflow-hidden');
            }
        });
    }

    // --- Dark Mode Toggle ---
    if (modeToggle) {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark');
            modeToggle.checked = true;
        } else if (savedTheme === 'light') {
            body.classList.remove('dark');
            modeToggle.checked = false;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Default to system preference if no saved theme
            body.classList.add('dark');
            modeToggle.checked = true;
        }

        modeToggle.addEventListener('change', () => {
            if (modeToggle.checked) {
                body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- Tabbed Content (e.g., on license.html) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs and hide all content
            tabButtons.forEach(btn => btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-blue-700', 'dark:text-blue-300', 'border-b-2', 'border-blue-500'));
            tabContents.forEach(content => content.classList.add('hidden'));

            // Activate clicked tab
            button.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-blue-700', 'dark:text-blue-300', 'border-b-2', 'border-blue-500');

            // Show corresponding content
            const targetId = button.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });

    // Activate the first tab by default if tabs exist
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }


    // --- Chooser Page Logic (chooser.html) ---
    const chooserQuestionsDiv = document.getElementById('chooserQuestions');
    const nextQuestionButton = document.getElementById('nextQuestion');
    const prevQuestionButton = document.getElementById('prevQuestion');
    const chooserResults = document.getElementById('chooserResults');
    const recommendedLicensesList = document.getElementById('recommendedLicensesList');
    const resetChooserButton = document.getElementById('resetChooser');
    const showAllLicensesButton = document.getElementById('showAllLicensesButton');

    let currentQuestionIndex = 0;
    // Ensure questions are correctly populated here
    const questions = Array.from(document.querySelectorAll('.question-block'));
    let answers = {};
    let chooserLicenses = []; // Will store licenses fetched for chooser

    if (chooserQuestionsDiv) {
        // Fetch licenses data
        fetch('data/licenses.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                chooserLicenses = data.licenses;
                showQuestion(currentQuestionIndex); // Show the first question after data is loaded
            })
            .catch(error => {
                console.error('Error fetching licenses data:', error);
                // Optionally display an error message to the user
                chooserQuestionsDiv.innerHTML = '<p class="text-red-500">Error loading questions. Please try again later.</p>';
            });

        function showQuestion(index) {
            questions.forEach((q, i) => {
                // Defensive check: Ensure 'q' is a valid element before accessing its style
                // This addresses the "Cannot read properties of undefined (reading 'style')" error
                if (q && q.style) { 
                    q.style.display = (i === index) ? 'block' : 'none';
                    q.setAttribute('aria-hidden', (i === index) ? 'false' : 'true');
                } else {
                    console.warn(`Skipping undefined or invalid question element at index ${i}. Element:`, q);
                }
            });

            prevQuestionButton.style.display = index > 0 ? 'inline-block' : 'none';
            nextQuestionButton.textContent = (index === questions.length - 1) ? 'Show Recommendations' : 'Next Question';
            if (chooserResults) chooserResults.classList.add('hidden'); // Hide results when navigating questions
        }

        function collectAnswer() {
            const currentQuestionBlock = questions[currentQuestionIndex];
            if (!currentQuestionBlock) return false; // Should not happen with robust questions array

            const selectedRadio = currentQuestionBlock.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const questionId = currentQuestionBlock.dataset.questionId;
                answers[questionId] = selectedRadio.value;
                return true;
            }
            return false; // No answer selected
        }

        function displayRecommendations() {
            // Filter licenses based on collected answers
            const filteredLicenses = chooserLicenses.filter(license => {
                let matches = true;
                // Loop through each answer and check if the license satisfies the criteria
                for (const questionId in answers) {
                    const userAnswer = answers[questionId];

                    switch (questionId) {
                        case '1': // Commercial Use?
                            if (userAnswer === 'yes' && !license.features.commercialUse) matches = false;
                            else if (userAnswer === 'no' && license.features.commercialUse) matches = false;
                            break;
                        case '2': // Modify?
                            if (userAnswer === 'yes' && !license.features.modify) matches = false;
                            else if (userAnswer === 'no' && license.features.modify) matches = false;
                            break;
                        case '3': // Distribute?
                            if (userAnswer === 'yes' && !license.features.distribute) matches = false;
                            else if (userAnswer === 'no' && license.features.distribute) matches = false;
                            break;
                        case '4': // Sublicense?
                            if (userAnswer === 'yes' && !license.features.sublicense) matches = false;
                            else if (userAnswer === 'no' && license.features.sublicense) matches = false;
                            break;
                        case '5': // Private Use?
                            if (userAnswer === 'yes' && !license.features.privateUse) matches = false;
                            else if (userAnswer === 'no' && license.features.privateUse) matches = false;
                            break;
                        case '6': // Require Attribution?
                            if (userAnswer === 'yes' && !license.obligations.requireAttribution) matches = false;
                            else if (userAnswer === 'no' && license.obligations.requireAttribution) matches = false;
                            break;
                        case '7': // State Changes?
                            if (userAnswer === 'yes' && !license.obligations.stateChanges) matches = false;
                            else if (userAnswer === 'no' && license.obligations.stateChanges) matches = false;
                            break;
                        // Add more cases for other questions/criteria
                    }
                    if (!matches) break; // If a criterion doesn't match, no need to check further
                }
                return matches;
            });

            // Display results
            if (recommendedLicensesList) {
                recommendedLicensesList.innerHTML = ''; // Clear previous results
                if (filteredLicenses.length > 0) {
                    filteredLicenses.forEach(license => {
                        const li = document.createElement('li');
                        li.className = 'bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow mb-2';
                        li.innerHTML = `
                            <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">${license.name}</h3>
                            <p class="text-gray-700 dark:text-gray-300 mb-2">${license.description}</p>
                            <a href="license.html?id=${license.id}" class="text-blue-600 hover:underline dark:text-blue-300">Learn More</a>
                        `;
                        recommendedLicensesList.appendChild(li);
                    });
                } else {
                    recommendedLicensesList.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">No licenses match your criteria. Try adjusting your answers.</p>';
                }
            }

            if (chooserResults) chooserResults.classList.remove('hidden');
            if (chooserQuestionsDiv) chooserQuestionsDiv.classList.add('hidden');
            nextQuestionButton.style.display = 'none'; // Hide next button on results page
            prevQuestionButton.style.display = 'none'; // Hide prev button on results page
            resetChooserButton.style.display = 'inline-block'; // Show reset button
            if (showAllLicensesButton) showAllLicensesButton.style.display = 'inline-block'; // Show "Show All Licenses" button
        }

        // Event Listeners for Chooser Navigation
        if (nextQuestionButton) {
            nextQuestionButton.addEventListener('click', () => {
                if (!collectAnswer()) {
                    alert('Please select an answer before proceeding.');
                    return;
                }

                let nextIndex = currentQuestionIndex + 1;
                if (nextIndex < questions.length) {
                    currentQuestionIndex = nextIndex;
                    showQuestion(currentQuestionIndex);
                } else {
                    // Reached the end, display recommendations
                    displayRecommendations();
                }
            });
        }

        if (prevQuestionButton) {
            prevQuestionButton.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    let prevIndex = currentQuestionIndex - 1;
                    currentQuestionIndex = prevIndex;
                    showQuestion(currentQuestionIndex);
                }
            });
        }

        if (resetChooserButton) {
            resetChooserButton.addEventListener('click', () => {
                currentQuestionIndex = 0;
                answers = {};
                questions.forEach(q => {
                    const radios = q.querySelectorAll('input[type="radio"]');
                    radios.forEach(radio => radio.checked = false);
                    if (q && q.style) { // Defensive check
                        q.style.display = 'none';
                    }
                });
                if (questions.length > 0 && questions[0] && questions[0].style) { // Defensive check
                    questions[0].style.display = 'block'; // Show only the first question
                    questions[0].setAttribute('aria-hidden', 'false');
                }


                if (chooserResults) chooserResults.classList.add('hidden');
                if (chooserQuestionsDiv) chooserQuestionsDiv.classList.remove('hidden');
                nextQuestionButton.style.display = 'inline-block';
                prevQuestionButton.style.display = 'none';
                nextQuestionButton.textContent = 'Next Question';
                if (showAllLicensesButton) showAllLicensesButton.style.display = 'none'; // Hide "Show All Licenses" button
            });
        }

        if (showAllLicensesButton) {
            showAllLicensesButton.addEventListener('click', () => {
                window.location.href = 'licenses.html'; // Navigate to the full licenses list
            });
        }
    }


    // --- License Detail Page Logic (license.html) ---
    const licenseDetailSection = document.getElementById('licenseDetail');
    if (licenseDetailSection) {
        const urlParams = new URLSearchParams(window.location.search);
        const licenseId = urlParams.get('id');

        if (licenseId) {
            fetch('data/licenses.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const license = data.licenses.find(lic => lic.id === licenseId);
                    if (license) {
                        document.getElementById('licenseName').textContent = license.name;
                        document.getElementById('licenseDescription').textContent = license.description;
                        document.getElementById('licenseLink').href = license.url;
                        document.getElementById('licenseLink').textContent = license.url; // Display URL text

                        // Populate Features
                        const featuresList = document.getElementById('licenseFeatures');
                        featuresList.innerHTML = '';
                        for (const key in license.features) {
                            if (license.features.hasOwnProperty(key)) {
                                const li = document.createElement('li');
                                li.className = 'flex items-center mb-2';
                                const iconClass = license.features[key] ? 'text-green-500' : 'text-red-500';
                                const icon = license.features[key] ? 'fa-check-circle' : 'fa-times-circle';
                                li.innerHTML = `<i class="fas ${icon} ${iconClass} mr-2"></i> ${formatFeatureName(key)}: ${license.features[key] ? 'Yes' : 'No'}`;
                                featuresList.appendChild(li);
                            }
                        }

                        // Populate Obligations
                        const obligationsList = document.getElementById('licenseObligations');
                        obligationsList.innerHTML = '';
                        for (const key in license.obligations) {
                            if (license.obligations.hasOwnProperty(key)) {
                                const li = document.createElement('li');
                                li.className = 'flex items-center mb-2';
                                const iconClass = license.obligations[key] ? 'text-yellow-500' : 'text-gray-500'; // Yellow for obligation, gray for not
                                const icon = license.obligations[key] ? 'fa-exclamation-circle' : 'fa-minus-circle';
                                li.innerHTML = `<i class="fas ${icon} ${iconClass} mr-2"></i> ${formatFeatureName(key)}: ${license.obligations[key] ? 'Required' : 'Not Required'}`;
                                obligationsList.appendChild(li);
                            }
                        }

                        // Populate Permissions (if applicable) - Assuming permissions are also true/false
                        const permissionsList = document.getElementById('licensePermissions');
                        if (permissionsList) { // Check if element exists for permissions
                            permissionsList.innerHTML = '';
                            if (license.permissions && Object.keys(license.permissions).length > 0) {
                                for (const key in license.permissions) {
                                    if (license.permissions.hasOwnProperty(key)) {
                                        const li = document.createElement('li');
                                        li.className = 'flex items-center mb-2';
                                        const iconClass = license.permissions[key] ? 'text-blue-500' : 'text-gray-500';
                                        const icon = license.permissions[key] ? 'fa-info-circle' : 'fa-minus-circle';
                                        li.innerHTML = `<i class="fas ${icon} ${iconClass} mr-2"></i> ${formatFeatureName(key)}: ${license.permissions[key] ? 'Permitted' : 'Not Permitted'}`;
                                        permissionsList.appendChild(li);
                                    }
                                }
                            } else {
                                permissionsList.innerHTML = '<li class="text-gray-600 dark:text-gray-400">No specific permissions listed.</li>';
                            }
                        }

                        // Populate Limitations (if applicable)
                        const limitationsList = document.getElementById('licenseLimitations');
                        if (limitationsList) { // Check if element exists for limitations
                            limitationsList.innerHTML = '';
                            if (license.limitations && Object.keys(license.limitations).length > 0) {
                                for (const key in license.limitations) {
                                    if (license.limitations.hasOwnProperty(key)) {
                                        const li = document.createElement('li');
                                        li.className = 'flex items-center mb-2';
                                        const iconClass = license.limitations[key] ? 'text-red-600' : 'text-gray-500';
                                        const icon = license.limitations[key] ? 'fa-ban' : 'fa-minus-circle';
                                        li.innerHTML = `<i class="fas ${icon} ${iconClass} mr-2"></i> ${formatFeatureName(key)}: ${license.limitations[key] ? 'Limited' : 'Not Limited'}`;
                                        limitationsList.appendChild(li);
                                    }
                                }
                            } else {
                                limitationsList.innerHTML = '<li class="text-gray-600 dark:text-gray-400">No specific limitations listed.</li>';
                            }
                        }


                    } else {
                        licenseDetailSection.innerHTML = '<p class="text-red-500">License not found.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching license details:', error);
                    licenseDetailSection.innerHTML = '<p class="text-red-500">Error loading license details. Please try again later.</p>';
                });
        } else {
            licenseDetailSection.innerHTML = '<p class="text-red-500">No license ID provided.</p>';
        }
    }

    // Helper function to format feature/obligation names for display
    function formatFeatureName(name) {
        // Convert camelCase to "Sentence Case"
        return name
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
    }


    // --- Licenses Page Logic (licenses.html) ---
    const licensesListDiv = document.getElementById('licensesList');
    const licenseSearchInput = document.getElementById('licenseSearch');

    let allLicenses = []; // To store all licenses for searching

    if (licensesListDiv) {
        fetch('data/licenses.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allLicenses = data.licenses;
                displayAllLicenses(allLicenses);
            })
            .catch(error => {
                console.error('Error fetching licenses data:', error);
                licensesListDiv.innerHTML = '<p class="text-red-500">Error loading licenses. Please try again later.</p>';
            });

        function displayAllLicenses(licensesToDisplay) {
            licensesListDiv.innerHTML = ''; // Clear previous listings
            if (licensesToDisplay.length > 0) {
                licensesToDisplay.forEach(license => {
                    const li = document.createElement('li');
                    li.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 transition-all duration-300 hover:shadow-lg';
                    li.innerHTML = `
                        <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">${license.name}</h3>
                        <p class="text-gray-700 dark:text-gray-300 mb-2">${license.description}</p>
                        <a href="license.html?id=${license.id}" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200">View Details</a>
                    `;
                    licensesListDiv.appendChild(li);
                });
            } else {
                licensesListDiv.innerHTML = '<p class="text-center text-gray-600 dark:text-gray-400">No licenses found matching your search.</p>';
            }
        }

        if (licenseSearchInput) {
            licenseSearchInput.addEventListener('input', (event) => {
                const searchTerm = event.target.value.toLowerCase();
                const filtered = allLicenses.filter(license =>
                    license.name.toLowerCase().includes(searchTerm) ||
                    license.description.toLowerCase().includes(searchTerm)
                );
                displayAllLicenses(filtered);
            });
        }
    }
});
