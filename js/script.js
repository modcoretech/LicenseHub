// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Licenses Page Logic (licenses.html) ---
    const licensesContainer = document.getElementById('licensesContainer');
    const searchInput = document.getElementById('search');
    const typeFilter = document.getElementById('typeFilter');
    const permissionCheckboxes = document.querySelectorAll('input[name="permission"]');
    const conditionCheckboxes = document.querySelectorAll('input[name="condition"]');
    const featureCheckboxes = document.querySelectorAll('input[name="feature"]'); // New
    const complexityFilter = document.getElementById('complexityFilter'); // New
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
                licensesContainer.innerHTML = '<p class="text-red-500 text-center" role="alert">Failed to load licenses. Please try again later.</p>';
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
                const licenseCard = document.createElement('div');
                licenseCard.className = 'bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800 mb-6 transition duration-300 hover:border-blue-500 hover:shadow-2xl';
                licenseCard.setAttribute('aria-labelledby', `license-name-${license.id}`);

                const permissionsHtml = license.permissions.length > 0 ? `
                    <p class="text-gray-400 mb-2"><strong class="text-white">Permissions:</strong>
                        ${license.permissions.map(p => `<span class="inline-block bg-green-800 text-green-100 text-xs px-2 py-0.5 rounded-full mr-1 my-0.5">${p}</span>`).join('')}
                    </p>` : '';

                const conditionsHtml = license.conditions.length > 0 ? `
                    <p class="text-gray-400 mb-2"><strong class="text-white">Conditions:</strong>
                        ${license.conditions.map(c => `<span class="inline-block bg-yellow-800 text-yellow-100 text-xs px-2 py-0.5 rounded-full mr-1 my-0.5">${c}</span>`).join('')}
                    </p>` : '';

                const limitationsHtml = license.limitations.length > 0 ? `
                    <p class="text-gray-400 mb-2"><strong class="text-white">Limitations:</strong>
                        ${license.limitations.map(l => `<span class="inline-block bg-red-800 text-red-100 text-xs px-2 py-0.5 rounded-full mr-1 my-0.5">${l}</span>`).join('')}
                    </p>` : '';

                const featuresHtml = license.key_features && license.key_features.length > 0 ? `
                    <p class="text-gray-400 mb-2"><strong class="text-white">Key Features:</strong>
                        ${license.key_features.map(f => `<span class="inline-block bg-purple-800 text-purple-100 text-xs px-2 py-0.5 rounded-full mr-1 my-0.5">${f}</span>`).join('')}
                    </p>` : '';

                licenseCard.innerHTML = `
                    <h2 id="license-name-${license.id}" class="text-3xl font-bold text-white mb-2">${license.name}</h2>
                    <span class="inline-block bg-blue-700 text-blue-100 text-sm font-semibold px-3 py-1 rounded-full mb-4">${license.type}</span>
                    <p class="text-gray-300 mb-4">${license.short_description}</p>
                    <button class="show-details-btn text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                            aria-expanded="false" aria-controls="details-${license.id}">
                        Show Details
                        <svg class="ml-1 w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    <div id="details-${license.id}" class="license-details mt-4 pt-4 border-t border-gray-700 hidden" aria-hidden="true">
                        <p class="text-gray-300 mb-4">${license.description}</p>
                        <div class="space-y-2 mb-4">
                            ${permissionsHtml}
                            ${conditionsHtml}
                            ${limitationsHtml}
                            ${featuresHtml}
                            ${license.complexity_level ? `<p class="text-gray-400"><strong>Complexity:</strong> ${license.complexity_level}</p>` : ''}
                            ${license.compatibility_notes ? `<p class="text-gray-400"><strong>Compatibility:</strong> ${license.compatibility_notes}</p>` : ''}
                            ${license.recommended_use_cases && license.recommended_use_cases.length > 0 ?
                                `<p class="text-gray-400"><strong>Recommended Uses:</strong> ${license.recommended_use_cases.join(', ')}</p>` : ''
                            }
                        </div>
                        ${license.full_text_url && license.full_text_url !== '#' ? `<a href="${license.full_text_url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-lg font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Read Full Text <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-7l4-4m0 0l-4 4m4-4H12"></path></svg></a>` : ''}
                        ${license.url && license.url !== license.full_text_url && license.url !== '#' ? `<a href="${license.url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-lg font-semibold inline-flex items-center ml-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Learn More <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-7l4-4m0 0l-4 4m4-4H12"></path></svg></a>` : ''}
                    </div>
                `;
                licensesContainer.appendChild(licenseCard);
            });

            // Add event listeners for new buttons after they are in the DOM
            document.querySelectorAll('.show-details-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const detailsDiv = document.getElementById(this.getAttribute('aria-controls'));
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !isExpanded);
                    detailsDiv.setAttribute('aria-hidden', isExpanded);
                    detailsDiv.classList.toggle('hidden');
                    // Toggle arrow icon
                    const svg = this.querySelector('svg');
                    if (svg) {
                        svg.classList.toggle('rotate-180', !isExpanded);
                    }
                });
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
            const selectedFeatures = Array.from(featureCheckboxes) // New
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            const selectedComplexity = complexityFilter.value; // New

            const filtered = allLicenses.filter(license => {
                const matchesSearch = license.name.toLowerCase().includes(searchTerm) ||
                                      license.description.toLowerCase().includes(searchTerm) ||
                                      license.short_description.toLowerCase().includes(searchTerm);
                const matchesType = selectedType === 'all' || license.type === selectedType;
                
                // Ensure ALL selected permissions/conditions/features are present
                const matchesPermissions = selectedPermissions.every(perm => license.permissions.includes(perm));
                const matchesConditions = selectedConditions.every(cond => license.conditions.includes(cond));
                
                // New feature filter
                const matchesFeatures = selectedFeatures.every(feat => license.key_features && license.key_features.includes(feat));
                
                // New complexity filter
                const matchesComplexity = selectedComplexity === 'all' || license.complexity_level === selectedComplexity;

                return matchesSearch && matchesType && matchesPermissions && matchesConditions && matchesFeatures && matchesComplexity;
            });
            displayLicenses(filtered);
        }

        searchInput.addEventListener('input', filterLicenses);
        typeFilter.addEventListener('change', filterLicenses);
        permissionCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterLicenses));
        conditionCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterLicenses));
        featureCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterLicenses)); // New
        complexityFilter.addEventListener('change', filterLicenses); // New

        resetFiltersButton.addEventListener('click', () => {
            searchInput.value = '';
            typeFilter.value = 'all';
            permissionCheckboxes.forEach(checkbox => checkbox.checked = false);
            conditionCheckboxes.forEach(checkbox => checkbox.checked = false);
            featureCheckboxes.forEach(checkbox => checkbox.checked = false); // New
            complexityFilter.value = 'all'; // New
            displayLicenses(allLicenses); // Show all licenses again
        });
    }

    // --- Chooser Page Logic (chooser.html) ---
    const chooserQuestionsDiv = document.getElementById('chooserQuestions');
    const nextQuestionButton = document.getElementById('nextQuestion');
    const prevQuestionButton = document.getElementById('prevQuestion');
    const chooserResults = document.getElementById('chooserResults');
    const recommendedLicensesList = document.getElementById('recommendedLicensesList');
    const resetChooserButton = document.getElementById('resetChooser');

    let currentQuestionIndex = 0;
    const questions = Array.from(document.querySelectorAll('.question-block'));
    let answers = {};
    let chooserLicenses = []; // Will store licenses fetched for chooser

    if (chooserQuestionsDiv) {
        fetch('data/licenses.json')
            .then(response => response.json())
            .then(data => {
                chooserLicenses = data;
                showQuestion(currentQuestionIndex);
            })
            .catch(error => {
                console.error('Error fetching licenses for chooser:', error);
                chooserResults.innerHTML = '<p class="text-red-500 text-center" role="alert">Failed to load chooser data. Please try again later.</p>';
            });

        function showQuestion(index) {
            questions.forEach((q, i) => {
                q.style.display = (i === index) ? 'block' : 'none';
                q.setAttribute('aria-hidden', (i === index) ? 'false' : 'true');
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
            const patentGrant = answers['patentGrant']; // New
            const isLibrary = answers['isLibrary']; // New
            const allowDerivatives = answers['allowDerivatives']; // New (for creative content)

            recommendations = chooserLicenses.filter(license => {
                let match = true;

                // 1. Filter by project type first
                if (projectType === 'software') {
                    match = match && license.type === 'Open Source';
                } else if (projectType === 'creative_content') {
                    match = match && license.type === 'Creative Commons';
                } else if (projectType === 'font') {
                    match = match && license.type === 'Font';
                } else if (projectType === 'commercial') {
                    match = match && license.type === 'Commercial';
                }

                if (!match) return false; // If type doesn't match, no need to check further

                // 2. Apply general filters applicable to most licenses
                if (commercialUse === 'yes') {
                    match = match && license.permissions.includes('Commercial Use');
                } else if (commercialUse === 'no') {
                    match = match && license.conditions.includes('Non-Commercial');
                }

                if (attribution === 'yes') {
                    match = match && license.conditions.includes('Attribution');
                } else if (attribution === 'no') {
                    // For "no attribution", ensure license does NOT explicitly require it
                    match = match && !license.conditions.includes('Attribution');
                }

                // Share Alike logic
                if (shareAlike === 'yes') {
                    match = match && license.conditions.includes('Share Alike');
                } else if (shareAlike === 'no') {
                    match = match && !license.conditions.includes('Share Alike');
                    // Additionally, if it's creative content AND no derivatives, handle that
                    if (projectType === 'creative_content' && allowDerivatives === 'no') {
                         match = match && license.conditions.includes('No Derivatives');
                    }
                }

                // 3. Software-specific filters
                if (projectType === 'software') {
                    if (patentGrant === 'yes') {
                        match = match && license.key_features.includes('Patent Grant');
                    } else if (patentGrant === 'no') {
                        // Exclude licenses strongly associated with patent grants if not desired
                        match = match && !license.key_features.includes('Patent Grant');
                    }

                    if (isLibrary === 'yes') {
                        // Prefer weak copyleft or permissive for libraries
                        match = match && (license.key_features.includes('Weak Copyleft') || license.key_features.includes('Permissive'));
                        match = match && !license.key_features.includes('Strong Copyleft'); // Exclude strong copyleft
                    } else if (isLibrary === 'no') {
                        // If not a library, strong copyleft is more acceptable
                        // No specific exclusion here, as permissive also works for apps
                    }
                }

                // 4. Creative Content specific filter (for "No Derivatives" branch)
                if (projectType === 'creative_content' && allowDerivatives === 'no') {
                    match = match && license.conditions.includes('No Derivatives');
                } else if (projectType === 'creative_content' && allowDerivatives === 'yes') {
                    // Ensure it doesn't have the No Derivatives condition
                    match = match && !license.conditions.includes('No Derivatives');
                }

                return match;
            });

            // Post-filtering refinements/prioritization
            // If specific share-alike or non-commercial are chosen for creative content, prioritize those specific CC licenses
            if (projectType === 'creative_content') {
                if (commercialUse === 'no' && shareAlike === 'yes' && attribution === 'yes' && allowDerivatives === 'yes') { // CC BY-NC-SA
                    recommendations.sort((a,b) => (a.id === 'cc-by-nc-sa-4.0' ? -1 : 1));
                } else if (commercialUse === 'no' && attribution === 'yes' && allowDerivatives === 'yes') { // CC BY-NC
                     recommendations.sort((a,b) => (a.id === 'cc-by-nc-4.0' ? -1 : 1));
                } else if (commercialUse === 'yes' && shareAlike === 'yes' && attribution === 'yes' && allowDerivatives === 'yes') { // CC BY-SA
                     recommendations.sort((a,b) => (a.id === 'cc-by-sa-4.0' ? -1 : 1));
                } else if (commercialUse === 'yes' && attribution === 'yes' && allowDerivatives === 'yes') { // CC BY
                     recommendations.sort((a,b) => (a.id === 'cc-by-4.0' ? -1 : 1));
                } else if (commercialUse === 'yes' && attribution === 'yes' && allowDerivatives === 'no') { // CC BY-ND
                     recommendations.sort((a,b) => (a.id === 'cc-by-nd-4.0' ? -1 : 1));
                } else if (commercialUse === 'no' && attribution === 'yes' && allowDerivatives === 'no') { // CC BY-NC-ND
                     recommendations.sort((a,b) => (a.id === 'cc-by-nc-nd-4.0' ? -1 : 1));
                } else if (attribution === 'no' && commercialUse === 'yes' && allowDerivatives === 'yes') { // Closest to Public Domain/CC0
                     recommendations.sort((a,b) => (a.id === 'cc0-1.0' ? -1 : 1));
                }
            }


            if (recommendations.length > 0) {
                // Remove duplicates and prioritize
                const uniqueRecommendations = Array.from(new Set(recommendations.map(l => l.id)))
                                                    .map(id => recommendations.find(l => l.id === id));

                uniqueRecommendations.forEach(license => {
                    const listItem = `
                        <div class="bg-gray-700 p-4 rounded-md shadow-md mb-3" aria-label="Recommended license: ${license.name}">
                            <h4 class="text-xl font-semibold text-white mb-1">${license.name}</h4>
                            <p class="text-gray-300">${license.short_description}</p>
                            ${license.url && license.url !== '#' ? `<a href="${license.url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-md inline-flex items-center mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">View License <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-7l4-4m0 0l-4 4m4-4H12"></path></svg></a>` : ''}
                            ${license.recommended_use_cases && license.recommended_use_cases.length > 0 ?
                                `<p class="text-gray-400 text-sm mt-2"><strong>Use Cases:</strong> ${license.recommended_use_cases.join(', ')}</p>` : ''
                            }
                        </div>
                    `;
                    recommendedLicensesList.innerHTML += listItem;
                });
            } else {
                recommendedLicensesList.innerHTML = '<p class="text-gray-400">No specific recommendations found based on your answers. Try adjusting your answers or <a href="licenses.html" class="text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">browse all licenses</a>.</p>';
            }
            chooserResults.classList.remove('hidden');
        }

        // Logic to conditionally show/hide questions and navigate
        nextQuestionButton.addEventListener('click', () => {
            if (!collectAnswer()) {
                alert('Please select an answer before proceeding.');
                return;
            }

            const projectType = answers['projectType'];

            // Determine the next question index based on current question and answers
            let nextIndex = currentQuestionIndex + 1;

            if (currentQuestionIndex === 0) { // After Project Type
                if (projectType === 'software' || projectType === 'font') {
                    // Skip creative content specific question (Q7)
                    questions[6].style.display = 'none';
                    delete answers['allowDerivatives']; // Clear prev answer
                } else if (projectType === 'creative_content') {
                    // Skip software specific questions (Q5, Q6)
                    questions[4].style.display = 'none';
                    questions[5].style.display = 'none';
                    delete answers['patentGrant'];
                    delete answers['isLibrary'];
                } else { // E.g., Commercial - may skip many questions
                    nextIndex = questions.length - 1; // Jump to end for commercial
                }
            } else if (currentQuestionIndex === 3 && projectType !== 'software') {
                // If not software and we are at Q4 (shareAlike), skip software specific questions (Q5, Q6)
                nextIndex = 6; // Jump to Q7 for creative_content or end
            } else if (currentQuestionIndex === 4 && projectType !== 'software') {
                // If not software and we are at Q5, this state should ideally not be reached, but just in case
                nextIndex = 6;
            }


            if (nextIndex < questions.length) {
                currentQuestionIndex = nextIndex;
                showQuestion(currentQuestionIndex);
            } else {
                // Reached the end of questions
                displayRecommendations();
                nextQuestionButton.style.display = 'none';
                prevQuestionButton.style.display = 'none';
            }
        });

        prevQuestionButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                let prevIndex = currentQuestionIndex - 1;
                const projectType = answers['projectType'];

                // Logic to go back correctly, considering skips
                if (currentQuestionIndex === 6 && projectType !== 'software') { // If currently at Q7 and not software
                    prevIndex = 3; // Go back to Q4 (shareAlike)
                } else if (currentQuestionIndex === 4 && projectType !== 'software') {
                    // This state ideally shouldn't be hit if skips work on next, but as a safeguard
                     prevIndex = 3;
                }

                currentQuestionIndex = prevIndex;
                showQuestion(currentQuestionIndex);
                chooserResults.classList.add('hidden'); // Hide results when going back
                nextQuestionButton.style.display = 'inline-block'; // Re-show next button
                nextQuestionButton.textContent = 'Next Question'; // Reset button text
            }
        });

        resetChooserButton.addEventListener('click', () => {
            currentQuestionIndex = 0;
            answers = {};
            questions.forEach(q => {
                const radios = q.querySelectorAll('input[type="radio"]');
                radios.forEach(radio => radio.checked = false);
                q.style.display = 'none'; // Hide all questions initially
            });
            questions[0].style.display = 'block'; // Show only the first question
            questions[0].setAttribute('aria-hidden', 'false');

            chooserResults.classList.add('hidden');
            nextQuestionButton.style.display = 'inline-block';
            prevQuestionButton.style.display = 'none';
            nextQuestionButton.textContent = 'Next Question';
        });

        // Initialize display of first question on page load
        showQuestion(currentQuestionIndex);
    }
});
