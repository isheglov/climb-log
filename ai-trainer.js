document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    const API_KEY = localStorage.getItem('geminiApiKey');
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

    // Initial welcome message
    addMessage("Hi! I'm your AI climbing trainer. I can help you with training advice, technique tips, and analyzing your climbing progress. What would you like to know?", 'ai');

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        chatInput.value = '';

        // Get climbing data for context
        const climbingData = getClimbingContext();

        // Process the message and get AI response
        await processMessage(message, climbingData);
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getClimbingContext() {
        // Get climbing data from localStorage
        const climbs = JSON.parse(localStorage.getItem('climbs')) || [];
        
        // Calculate some basic stats
        const stats = climbs.reduce((acc, climb) => {
            acc.totalClimbs++;
            acc.grades.push(parseFloat(climb.grade));
            return acc;
        }, { totalClimbs: 0, grades: [] });

        if (stats.grades.length > 0) {
            stats.averageGrade = stats.grades.reduce((a, b) => a + b) / stats.grades.length;
            stats.maxGrade = Math.max(...stats.grades);
        }

        return stats;
    }

    async function processMessage(message, context) {
        // Show typing indicator
        addMessage('Thinking...', 'ai');

        try {
            console.log(context);

            const contextPrompt = `Context: User has completed ${context.totalClimbs} climbs. 
                Average grade: UIAA ${context.averageGrade?.toFixed(0) || '0'}. 
                Max grade: UIAA ${context.maxGrade || '0'}.
                
                User question: ${message}
                
                Please provide specific climbing advice based on this context.`;

            console.log(contextPrompt);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: contextPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        responseMimeType: "text/plain"
                    }
                })
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            

            console.log(aiResponse);
            console.log(data);

            // Remove typing indicator and add AI response
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage('Sorry, I had trouble processing that request. Please try again.', 'ai');
        }
    }
}); 
