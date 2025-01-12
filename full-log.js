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
                
                const gradeElement = document.createElement('div');
                gradeElement.className = 'grade';
                gradeElement.textContent = climb.grade;
                
                const colorDot = document.createElement('div');
                colorDot.className = 'color-dot';
                // Convert color name to actual color if needed
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
                colorDot.style.backgroundColor = colorMap[climb.color.toLowerCase()] || climb.color;
                if (climb.color.toLowerCase() === 'white') {
                    colorDot.style.border = '1px solid #ccc';
                }

                climbElement.appendChild(gradeElement);
                climbElement.appendChild(colorDot);
                climbsContainer.appendChild(climbElement);
            });

            dateGroup.appendChild(climbsContainer);
            fullClimbList.appendChild(dateGroup);
        });
}); 
