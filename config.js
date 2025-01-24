document.addEventListener('DOMContentLoaded', function() {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const geminiKeyInput = document.getElementById('geminiKey');
    const toggleKeyButton = document.getElementById('toggleKey');

    // Load saved API key on page load
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) {
        geminiKeyInput.value = savedKey;
    }

    // Toggle password visibility
    toggleKeyButton.addEventListener('click', function() {
        const type = geminiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        geminiKeyInput.setAttribute('type', type);
        
        // Toggle eye icon
        const icon = toggleKeyButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    apiKeyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const apiKey = geminiKeyInput.value.trim();
        
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            alert('API key saved successfully!');
        } else {
            alert('Please enter an API key');
        }
    });

    function displayFocusSuggestions() {                                                                                                                   
        const focusArea = document.getElementById('focus-area');                                                                                           
        const focusSuggestions = localStorage.getItem('focusSuggestions');                                                                                 
                                                                                                                                                           
        if (focusSuggestions) {                                                                                                                            
            try {                                                                                                                                          
                const suggestions = JSON.parse(focusSuggestions);                                                                                          
                let list = '<h2>Focus Area</h2><ul>';                                                                                                      
                suggestions.forEach(suggestion => {                                                                                                        
                    list += `<li>${suggestion}</li>`;                                                                                                      
                });                                                                                                                                        
                list += '</ul>';                                                                                                                           
                focusArea.innerHTML = list;                                                                                                                
            } catch (e) {                                                                                                                                  
                console.error("Error parsing focus suggestions:", e);                                                                                      
                focusArea.innerHTML = '<h2>Focus Area</h2><p>Error loading focus suggestions.</p>';                                                        
            }                                                                                                                                              
        } else {                                                                                                                                           
            focusArea.innerHTML = '<h2>Focus Area</h2><p>No focus suggestions yet.</p>';                                                                   
        }                                                                                                                                                  
    }                                                                                                                                                      
                                                                                                                                                           
    // Display focus suggestions on page load                                                                                                              
    displayFocusSuggestions(); 
}); 
