document.addEventListener('DOMContentLoaded', function() {
    // Load and display climbs grouped by date
    const fullClimbList = document.getElementById('full-climb-list');
    const climbs = JSON.parse(localStorage.getItem('climbs') || '[]');

    // Group climbs by date
    const climbsByDate = climbs.reduce((groups, climb) => {
        const date = climb.date.split('T')[0]; // Ensure we only use the date part
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(climb);
        return groups;
    }, {});

    // Display climbs grouped by date
    Object.keys(climbsByDate)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach(date => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            const dateHeader = document.createElement('h2');
            dateHeader.textContent = new Date(date).toLocaleDateString();
            dateGroup.appendChild(dateHeader);

            const climbsContainer = document.createElement('div');
            climbsContainer.className = 'climbs-container';

            const climbs = climbsByDate[date];
            climbs.forEach(climb => {
                const climbElement = document.createElement('div');
                climbElement.className = 'climb-card';
                
                // Create grade container with circular style matching index page
                const gradeContainer = document.createElement('div');
                gradeContainer.className = 'grade-container circular-grade';
                
                const gradeElement = document.createElement('span');
                gradeElement.className = 'grade-text';
                gradeElement.textContent = climb.grade;
                
                // Use the grade container itself as the colored circle instead of a separate badge
                const colorMap = {
                    'yellow': '#FFD700',
                    'green': '#32CD32',
                    'blue': '#1E90FF',
                    'red': '#FF4444',
                    'black': '#000000',
                    'purple': '#800080',
                    'orange': '#FFA500',
                    'pink': '#FF69B4',
                    'white': '#FFFFFF'
                };
                gradeContainer.style.backgroundColor = colorMap[climb.color.toLowerCase()] || climb.color;
                if (climb.color.toLowerCase() === 'white') {
                    gradeContainer.style.border = '1px solid #ccc';
                }

                gradeContainer.appendChild(gradeElement);
                climbElement.appendChild(gradeContainer);
                
                // Add delete button if needed
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Delete';
                
                // Add delete functionality using UUID, matching index page style
                deleteButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this climb?')) {
                        try {
                            const storedClimbs = JSON.parse(localStorage.getItem('climbs') || '[]');
                            const updatedClimbs = storedClimbs.filter(storedClimb => 
                                storedClimb.uuid !== climb.uuid
                            );
                            
                            localStorage.setItem('climbs', JSON.stringify(updatedClimbs));
                            
                            // Remove the climb element from the DOM
                            climbElement.remove();
                            
                            // If this was the last climb for this date, remove the date header
                            const remainingClimbsForDate = climbsContainer.children.length;
                            if (remainingClimbsForDate === 0) {
                                dateGroup.remove();
                            }
                            
                        } catch (error) {
                            console.error('Error deleting climb:', error);
                            alert('Failed to delete climb. Please try again.');
                        }
                    }
                });
                
                climbElement.appendChild(deleteButton);
                climbsContainer.appendChild(climbElement);
            });

            dateGroup.appendChild(climbsContainer);
            fullClimbList.appendChild(dateGroup);
        });
}); 
