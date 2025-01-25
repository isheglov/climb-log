document.addEventListener('DOMContentLoaded', () => {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const geminiKeyInput = document.getElementById('geminiKey');
    const toggleKeyButton = document.getElementById('toggleKey');
    const downloadDataButton = document.getElementById('downloadData');
    const uploadDataInput = document.getElementById('uploadData');

    // Load API key from localStorage on page load
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        geminiKeyInput.value = savedApiKey;
    }

    // Toggle password visibility
    toggleKeyButton.addEventListener('click', () => {
        const type = geminiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        geminiKeyInput.setAttribute('type', type);
        toggleKeyButton.querySelector('i').classList.toggle('fa-eye');
        toggleKeyButton.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Save API key to localStorage when form is submitted
    apiKeyForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        const apiKey = geminiKeyInput.value.trim();
        localStorage.setItem('geminiApiKey', apiKey);
        alert('API Key saved!');
    });

    // Function to download data
    downloadDataButton.addEventListener('click', () => {
        downloadClimbingData();
    });

    // Function to handle file upload
    uploadDataInput.addEventListener('change', (event) => {
        uploadClimbingData(event);
    });

    function downloadClimbingData() {
        const dataToDownload = {
            climbs: JSON.parse(localStorage.getItem('climbs') || '[]'),
            chatHistoryForLLM: JSON.parse(localStorage.getItem('chatHistoryForLLM') || '[]'),
            chatHistoryForHuman: JSON.parse(localStorage.getItem('chatHistoryForHuman') || '[]'),
            focusSuggestions: JSON.parse(localStorage.getItem('focusSuggestions') || '[]')
        };

        const jsonData = JSON.stringify(dataToDownload, null, 2); // Pretty print JSON

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'climbing_data.json'; // File name for download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up URL object
    }

    function uploadClimbingData(event) {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);

                // Validate JSON structure (optional, but recommended)
                if (jsonData.climbs && jsonData.chatHistoryForLLM && jsonData.chatHistoryForHuman && jsonData.focusSuggestions) {
                    localStorage.setItem('climbs', JSON.stringify(jsonData.climbs));
                    localStorage.setItem('chatHistoryForLLM', JSON.stringify(jsonData.chatHistoryForLLM));
                    localStorage.setItem('chatHistoryForHuman', JSON.stringify(jsonData.chatHistoryForHuman));
                    localStorage.setItem('focusSuggestions', JSON.stringify(jsonData.focusSuggestions));
                    alert('Data uploaded and imported successfully!');
                } else {
                    alert('Invalid JSON file structure. Please upload a file with the correct format.');
                }
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Error parsing JSON file. Please ensure the file is valid JSON.');
            }
        };
        reader.readAsText(file);
    }
}); 
