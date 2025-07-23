// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Universal Dark Mode Toggle (Optional, but good for accessibility)
    // For this project, we are defaulting to dark mode so this is not explicitly needed.
    // However, if a toggle were added, this would be the place for its logic.

    // Font family added via Google Fonts in HTML, applied in style.css

    // --- Licenses Page Logic (licenses.html) ---
    const licensesContainer = document.getElementById('licensesContainer');
    const searchInput = document.getElementById('search');
    const typeFilter = document.getElementById('typeFilter');
    const permissionCheckboxes = document.querySelectorAll('input[name="permission"]');
    const conditionCheckboxes = document.querySelectorAll('input[name="condition"]');
    const resetFiltersButton = document.getElementById('resetFilters');
    const noLicensesFoundDiv = document.getElementById('noLicensesFound');

    let allLicenses = [];

    if (licensesContainer) {
        fetch('data/licenses.json')
            .then(response => response.json())
            .then(data => {
                allLicenses = data;
                displayLicenses(allLicenses);
            })
            .catch(error => {
                console.error('Error fetching licenses:', error);
                licensesContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load licenses. Please try again later.</p>';
            });

        function displayLicenses(licensesToDisplay) {
            licensesContainer.innerHTML = '';
            if (licensesToDisplay.length === 0) {
                noLicensesFoundDiv.style.display = 'block';
                return;
            } else {
                noLicensesFoundDiv.style.display = 'none';
            }

            licensesToDisplay.forEach(license => {
                const licenseCard = `
                    <div class="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800 mb-6 transition duration-300 hover:border-blue-500 hover:shadow-2xl">
                        <h2 class="text-3xl font-bold text-white mb-2">${license.name}</h2>
                        <span class="inline-block bg-blue-700 text-blue-100 text-sm font-semibold px-3 py-1 rounded-full mb-4">${license.type}</span>
                        <p class="text-gray-300 mb-4">${license.description}</p>
                        <div class="space-y-2 mb-4">
                            ${license.permissions.length > 0 ? `
                                <p class="text-gray-400"><strong class="text-white">Permissions:</strong>
                                    ${license.permissions.map(p => `<span class="inline-block bg-green-800 text-green-100 text-xs px-2 py-0.5 rounded-full mr-1">${p}</span>`).join('')}
                                </p>` : ''}
                            ${license.conditions.length > 0 ? `
                                <p class="text-gray-400"><strong class="text-white">Conditions:</strong>
                                    ${license.conditions.map(c => `<span class="inline-block bg-yellow-800 text-yellow-100 text-xs px-2 py-0.5 rounded-full mr-1">${c}</span>`).join('')}
                                </p>` : ''}
                            ${license.limitations.length > 0 ? `
                                <p class="text-gray-400"><strong class="text-white">Limitations:</strong>
                                    ${license.limitations.map(l => `<span class="inline-block bg-red-800 text-red-100 text-xs px-2 py-0.5 rounded-full mr-1">${l}</span>`).join('')}
                                </p>` : ''}
                        </div>
                        ${license.url ? `<a href="${license.url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-lg font-semibold inline-flex items-center">Learn More <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-7l4-4m0 0l-4 4m4-4H12"></path></svg></a>` : ''}
                    </div>
                `;
                licensesContainer.innerHTML += licenseCard;
            });
        }

        function filterLicenses() {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedType = typeFilter.value;
            const selectedPermissions = Array.from(permissionCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            const selectedConditions = Array.from(conditionCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            const filtered = allLicenses.filter(license => {
                const matchesSearch = license.name.toLowerCase().includes(searchTerm) ||
                                      license.description.toLowerCase().includes(searchTerm);
                const matchesType = selectedType === 'all' || license.type === selectedType;
                const matchesPermissions = selectedPermissions.every(perm => license.permissions.includes(perm));
                const matchesConditions = selectedConditions.every(cond => license.conditions.includes(cond));

                return matchesSearch && matchesType && matchesPermissions && matchesConditions;
            });
            displayLicenses(filtered);
        }

        searchInput.addEventListener('input', filterLicenses);
        typeFilter.addEventListener('change', filterLicenses);
        permissionCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterLicenses));
        conditionCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterLicenses));

        resetFiltersButton.addEventListener('click', () => {
            searchInput.value = '';
            typeFilter.value = 'all';
            permissionCheckboxes.forEach(checkbox => checkbox.checked = false);
            conditionCheckboxes.forEach(checkbox => checkbox.checked = false);
            displayLicenses(allLicenses); // Show all licenses again
        });
    }

    // --- Chooser Page Logic (chooser.html) ---
    const chooserQuestions = document.getElementById('chooserQuestions');
    const nextQuestionButton = document.getElementById('nextQuestion');
    const prevQuestionButton = document.getElementById('prevQuestion');
    const chooserResults = document.getElementById('chooserResults');
    const recommendedLicensesList = document.getElementById('recommendedLicensesList');
    const resetChooserButton = document.getElementById('resetChooser');

    let currentQuestionIndex = 0;
    const questions = Array.from(document.querySelectorAll('.question-block'));
    let answers = {};
    let chooserLicenses = []; // Will store licenses fetched for chooser

    if (chooserQuestions) {
        // Fetch licenses for chooser as well
        fetch('data/licenses.json')
            .then(response => response.json())
            .then(data => {
                chooserLicenses = data;
                showQuestion(currentQuestionIndex);
            })
            .catch(error => {
                console.error('Error fetching licenses for chooser:', error);
                chooserResults.innerHTML = '<p class="text-red-500 text-center">Failed to load chooser data. Please try again later.</p>';
            });

        function showQuestion(index) {
            questions.forEach((q, i) => {
                q.style.display = (i === index) ? 'block' : 'none';
            });

            prevQuestionButton.style.display = index > 0 ? 'inline-block' : 'none';
            nextQuestionButton.textContent = (index === questions.length - 1) ? 'Show Recommendations' : 'Next Question';
            if (chooserResults) chooserResults.classList.add('hidden'); // Hide results when navigating questions
        }

        function collectAnswer() {
            const currentQuestionBlock = questions[currentQuestionIndex];
            const radios = currentQuestionBlock.querySelectorAll('input[type="radio"]');
            let answered = false;
            radios.forEach(radio => {
                if (radio.checked) {
                    answers[radio.name] = radio.value;
                    answered = true;
                }
            });
            return answered;
        }

        function displayRecommendations() {
            recommendedLicensesList.innerHTML = '';
            let recommendations = [];

            const projectType = answers['projectType'];
            const commercialUse = answers['commercialUse'];
            const attribution = answers['attribution'];
            const shareAlike = answers['shareAlike'];
            const sourceCode = answers['sourceCode']; // Specific to software

            recommendations = chooserLicenses.filter(license => {
                let match = true;

                // Filter by project type
                if (projectType === 'software') {
                    match = match && license.type === 'Open Source';
                } else if (projectType === 'creative_content') {
                    match = match && license.type === 'Creative Commons';
                } else if (projectType === 'font') {
                    match = match && license.type === 'Font';
                }

                // Apply general filters applicable to most licenses
                if (commercialUse === 'yes') {
                    match = match && license.permissions.includes('Commercial Use');
                } else if (commercialUse === 'no') {
                     // For 'no' commercial use, explicitly exclude licenses that _only_ allow commercial use
                     // or for creative commons specifically look for 'Non-Commercial' condition
                    if (license.type === 'Creative Commons') {
                        match = match && license.conditions.includes('Non-Commercial');
                    } else { // For open source, if 'Commercial Use' is a permission, it implies it allows it.
                             // This is a simplification; a stricter interpretation might check for explicit 'non-commercial' restrictions.
                        match = match && !license.permissions.includes('Commercial Use (Explicitly Required)'); // Example: no such permission
                    }
                }


                if (attribution === 'yes') {
                    match = match && license.conditions.includes('Attribution');
                } else if (attribution === 'no') {
                    match = match && !license.conditions.includes('Attribution');
                }

                if (shareAlike === 'yes') {
                    match = match && license.conditions.includes('Share Alike');
                } else if (shareAlike === 'no') {
                    match = match && !license.conditions.includes('Share Alike');
                }

                // Software-specific filter
                if (projectType === 'software' && sourceCode === 'yes') {
                    // This implies copyleft licenses that ensure source code availability and re-sharing
                    match = match && (license.conditions.includes('Disclose Source') || license.conditions.includes('Share Alike'));
                } else if (projectType === 'software' && sourceCode === 'no') {
                    // This implies permissive licenses that don't force source code re-sharing
                    match = match && !license.conditions.includes('Disclose Source') && !license.conditions.includes('Share Alike');
                }

                return match;
            });

            if (recommendations.length > 0) {
                recommendations.forEach(license => {
                    const listItem = `
                        <div class="bg-gray-700 p-4 rounded-md shadow-md mb-3">
                            <h4 class="text-xl font-semibold text-white mb-1">${license.name}</h4>
                            <p class="text-gray-300">${license.description}</p>
                            ${license.url ? `<a href="${license.url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-md inline-flex items-center mt-2">View License <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-7l4-4m0 0l-4 4m4-4H12"></path></svg></a>` : ''}
                            ${license.recommended_use_cases && license.recommended_use_cases.length > 0 ?
                                `<p class="text-gray-400 text-sm mt-2"><strong>Use Cases:</strong> ${license.recommended_use_cases.join(', ')}</p>` : ''
                            }
                        </div>
                    `;
                    recommendedLicensesList.innerHTML += listItem;
                });
            } else {
                recommendedLicensesList.innerHTML = '<p class="text-gray-400">No specific recommendations found. Try adjusting your answers or browse all licenses.</p>';
            }
            chooserResults.classList.remove('hidden');
        }

        nextQuestionButton.addEventListener('click', () => {
            if (!collectAnswer()) {
                alert('Please select an answer before proceeding.');
                return;
            }

            // Logic to conditionally show/hide questions
            const currentQuestionBlock = questions[currentQuestionIndex];
            const questionId = currentQuestionBlock.dataset.questionId;

            if (questionId === '1') { // If project type is chosen
                if (answers['projectType'] === 'software' || answers['projectType'] === 'creative_content' || answers['projectType'] === 'font') {
                    // Show common questions (commercial use, attribution, share-alike)
                    questions[1].style.display = 'block'; // Q2 Commercial Use
                    questions[2].style.display = 'block'; // Q3 Attribution
                    questions[3].style.display = 'block'; // Q4 Share-alike

                    // Hide software-specific question if not software
                    if (answers['projectType'] !== 'software') {
                        questions[4].style.display = 'none'; // Q5 Source Code
                        delete answers['sourceCode']; // Clear previous answer if type changed
                    }
                }
            }

            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                // Skip software-specific question if project type is not software
                if (currentQuestionIndex === 4 && answers['projectType'] !== 'software') {
                    currentQuestionIndex++; // Skip to end/recommendations
                }
                showQuestion(currentQuestionIndex);
            }

            if (currentQuestionIndex === questions.length -1 || (currentQuestionIndex === 3 && answers['projectType'] !== 'software') ) { // At the last question or effectively the last due to skipping
                 displayRecommendations();
                 nextQuestionButton.style.display = 'none';
                 prevQuestionButton.style.display = 'none';
            }
        });

        prevQuestionButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                // Handle reverse skipping for software-specific question
                 if (currentQuestionIndex === 4 && answers['projectType'] !== 'software') {
                    currentQuestionIndex--;
                }
                showQuestion(currentQuestionIndex);
                chooserResults.classList.add('hidden'); // Hide results when going back
                nextQuestionButton.style.display = 'inline-block'; // Re-show next button
            }
        });


        resetChooserButton.addEventListener('click', () => {
            currentQuestionIndex = 0;
            answers = {};
            questions.forEach(q => {
                const radios = q.querySelectorAll('input[type="radio"]');
                radios.forEach(radio => radio.checked = false);
            });
            showQuestion(currentQuestionIndex);
            chooserResults.classList.add('hidden');
            nextQuestionButton.style.display = 'inline-block';
            nextQuestionButton.textContent = 'Next Question';
        });

        // Initialize display of first question
        showQuestion(currentQuestionIndex);
    }
});
