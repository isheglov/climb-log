document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const clearButton = document.getElementById('clear-button');
    
    const API_KEY = localStorage.getItem('geminiApiKey');
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

    let conversationHistoryForLLM = [];
    let conversationHistoryForHuman = [];

    // Load existing chat history from localStorage
    const savedHistoryForLLM = localStorage.getItem('chatHistoryForLLM');
    const savedHistoryForHumanJSON = localStorage.getItem('chatHistoryForHuman');
    if (savedHistoryForHumanJSON) {
        conversationHistoryForHuman = JSON.parse(savedHistoryForHumanJSON);
        conversationHistoryForLLM = JSON.parse(savedHistoryForLLM);
        // Replay saved messages in the UI
        conversationHistoryForHuman.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.parts[0].text, 'user');
            } else if (msg.role === 'model') {
                addMessage(msg.parts[0].text, 'ai');
            }
        });
    }

    // Initial welcome message (only if no history)
    if (!savedHistoryForHumanJSON) {
        addMessage("Hi! I'm your AI climbing trainer. I can help you with training advice, technique tips, and analyzing your climbing progress. What would you like to know?", 'ai');
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add clear button event listener
    clearButton.addEventListener('click', () => {
        // Clear the UI
        chatMessages.innerHTML = '';
        
        // Clear the conversation history
        conversationHistoryForLLM = [];
        conversationHistoryForHuman = [];
        localStorage.removeItem('chatHistoryForLLM');
        localStorage.removeItem('chatHistoryForHuman');
        
        // Add initial welcome message
        addMessage("Hi! I'm your AI climbing trainer. I can help you with training advice, technique tips, and analyzing your climbing progress. What would you like to know?", 'ai');
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
            const contextPrompt = `Context: User has completed ${context.totalClimbs} climbs. 
                Average grade: UIAA ${context.averageGrade?.toFixed(0) || '0'}
                Max grade: UIAA ${context.maxGrade || '0'}

                User Question: ${message}

                Response Guidelines:
                1. For greetings or very short messages:
                   - If it's just "hi", "hello", etc. → Reply only with "Hello! How can I help you with your climbing questions?"
                   - No additional advice in these cases

                2. For non-climbing questions:
                   - Keep response under 10 words
                   - Stay focused on climbing-related topics

                3. For climbing questions:
                   - Provide specific advice based on user's climbing stats
                   - Keep responses focused and concise (3-4 paragraphs max)
                   - Use context data to personalize advice

                4. If question is vague:
                   - Ask for clarification
                   - Keep initial response brief
                   - Guide user toward more specific questions

                Remember: Always prioritize clarity and brevity over lengthy explanations.`;

            // Add current user message to history
            conversationHistoryForLLM.push({
                role: "user",
                parts: [{
                    text: contextPrompt
                }]
            });

            conversationHistoryForHuman.push({
                role: "user",
                parts: [{
                    text: message
                }]
            });


            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: conversationHistoryForLLM,
                    generationConfig: {
                        temperature: 0.4,
                        topK: 40,
                        topP: 0.8,
                        "stopSequences": [
                            "\n###END"
                        ],
                        maxOutputTokens: 800,
                        responseMimeType: "text/plain"
                    }
                })
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Extract focus suggestions using LLM
            const focusSuggestion = await extractFocusSuggestionFromLLM(aiResponse);
            if (focusSuggestion) {
                // Get existing suggestions from localStorage
                let existingSuggestions = JSON.parse(localStorage.getItem('focusSuggestions')) || [];
                
                // Add the new suggestion to the array
                existingSuggestions.push(focusSuggestion);

                // Save the updated array back to localStorage
                localStorage.setItem('focusSuggestions', JSON.stringify(existingSuggestions));
            }

            // Add AI response to history
            conversationHistoryForLLM.push({
                role: "model",
                parts: [{
                    text: aiResponse
                }]
            });

            conversationHistoryForHuman.push({
                role: "model",
                parts: [{
                    text: aiResponse
                }]
            });

            // Save updated history to localStorage
            localStorage.setItem('chatHistoryForLLM', JSON.stringify(conversationHistoryForLLM));
            localStorage.setItem('chatHistoryForHuman', JSON.stringify(conversationHistoryForHuman));

            // Remove typing indicator and add AI response
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(chatMessages.lastChild);
            addMessage('Sorry, I had trouble processing that request. Please try again.', 'ai');
        }
    }

    async function extractFocusSuggestionFromLLM(text) {
        const suggestionPrompt = `Does this message contain climbing suggestion? If yes, summarize this suggestion in a short but clear form. If not, respond with empty string.
        Message:
        ${text}`;

        console.log("Suggestion Prompt:", suggestionPrompt);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: suggestionPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2, // Keep temperature low for summarization
                        maxOutputTokens: 100, // Limit output tokens for summary
                    }
                })
            });

            if (!response.ok) {
                console.error('HTTP error!', response.status);
                return null;
            }

            const data = await response.json();
            let llmSuggestion = data.candidates[0].content.parts[0].text;
            llmSuggestion = llmSuggestion.trim();

            // Check if the response is an empty string or indicates no suggestion
            if (!llmSuggestion || llmSuggestion.toLowerCase().includes("no suggestion")) {
                console.log("No suggestion found by LLM.");
                return null; // Return null if no suggestion is found
            }

            return llmSuggestion;

        } catch (error) {
            console.error('Error extracting focus suggestion:', error);
            console.error(error);
            return null;
        }
    }
}); 
