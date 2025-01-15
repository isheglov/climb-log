document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

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

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        chatInput.value = '';

        // Get climbing data for context
        const climbingData = getClimbingContext();

        // Process the message and get AI response
        processMessage(message, climbingData);
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
            // Here you would typically make an API call to your AI service
            // For now, we'll use some basic response logic
            const response = await getAIResponse(message, context);
            
            // Remove typing indicator and add AI response
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage(response, 'ai');

        } catch (error) {
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage('Sorry, I had trouble processing that request. Please try again.', 'ai');
        }
    }

    function getAIResponse(message, context) {
        // This is a simple example - replace with actual AI integration
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerMessage = message.toLowerCase();
                
                // Simple response logic based on keywords
                if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
                    resolve("As a beginner, focus on proper technique and footwork. Start with easier routes (V0-V2) and work on maintaining balance and using your legs more than your arms. Would you like specific technique tips?");
                }
                else if (lowerMessage.includes('progress') || lowerMessage.includes('improve')) {
                    const response = context.totalClimbs > 0 
                        ? `Based on your logs, you've completed ${context.totalClimbs} climbs with an average grade of V${context.averageGrade.toFixed(1)}. To improve, try working on routes slightly above your current level and focus on specific techniques you find challenging.`
                        : "To track your progress, start logging your climbs regularly. This will help identify patterns and areas for improvement. Would you like tips on structured training?";
                    resolve(response);
                }
                else if (lowerMessage.includes('technique') || lowerMessage.includes('tips')) {
                    resolve("Here are some key technique tips: 1) Keep your arms straight when possible to conserve energy, 2) Focus on pushing with your legs rather than pulling with your arms, 3) Try to keep your center of gravity close to the wall, 4) Look for opportunities to rest on better holds. Would you like me to elaborate on any of these?");
                }
                else {
                    resolve("I can help you with climbing technique, training plans, and progress analysis. What specific aspect would you like to know more about?");
                }
            }, 1000);
        });
    }
}); 