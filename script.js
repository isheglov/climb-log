let selectedGrade = '';
let selectedColor = '';

// Define available grades
const grades = ['4-', '4', '4+', '5-', '5', '5+', '6-', '6', '6+', '7-', '7', '7+', '8-', '8', '8+', '9-', '9', '9+', '10-', '10', '10+', '11-', '11', '11+', '12-', '12'];
const gradeButtonsContainer = document.getElementById('grade-buttons');

grades.forEach(grade => {
    const btn = document.createElement('button');
    btn.className = 'grade-btn';
    btn.textContent = grade;
    btn.onclick = () => selectGrade(grade, btn);
    gradeButtonsContainer.appendChild(btn);
});

// Define available colors
const colors = ['Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'Grey'];
const colorButtonsContainer = document.getElementById('color-buttons');

colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.backgroundColor = color.toLowerCase(); // Ensure valid CSS color
    btn.title = color; // Tooltip for accessibility
    btn.onclick = () => selectColor(color, btn);
    colorButtonsContainer.appendChild(btn);
});

function selectGrade(grade, button) {
    selectedGrade = grade;
    // Deselect all other grade buttons
    document.querySelectorAll('.grade-btn').forEach(btn => btn.classList.remove('selected'));
    // Highlight the selected button
    button.classList.add('selected');
}

function selectColor(color, button) {
    selectedColor = color;
    // Deselect all other color buttons
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    // Highlight the selected button
    button.classList.add('selected');
}

// Get today's date
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

window.onload = function () {
    document.getElementById('climb-date').value = getTodayDate();
    renderClimbs();
};

function getClimbs() {
    return JSON.parse(localStorage.getItem('climbs')) || [];
}

function saveClimbs(climbs) {
    localStorage.setItem('climbs', JSON.stringify(climbs));
}

function addClimb() {
    const date = document.getElementById('climb-date').value;

    if (!date || !selectedGrade || !selectedColor) {
        alert('Please fill in all fields.');
        return;
    }

    const climbs = getClimbs();
    const climb = {
        uuid: crypto.randomUUID(), // Add UUID to climb
        grade: selectedGrade,
        color: selectedColor,
        date: new Date().toISOString()
    };
    climbs.unshift(climb); // Add to the beginning
    saveClimbs(climbs);
    renderClimbs();

    // Reset form fields
    selectedGrade = '';
    selectedColor = '';
    document.querySelectorAll('.grade-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('climb-date').value = getTodayDate();
}

function renderClimbs() {
    const climbList = document.getElementById('climb-list');
    climbList.innerHTML = '<h2>Your Climbs Today</h2>';
    const climbs = getClimbs();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter for today's climbs only
    const todayClimbs = climbs.filter(climb => climb.date.split('T')[0] === today);

    if (todayClimbs.length === 0) {
        climbList.innerHTML += '<p class="no-climbs">No climbs logged yet today.</p>';
        return;
    }

    todayClimbs.forEach((climb, index) => {
        // Calculate text color based on background color
        const textColor = shouldUseWhiteText(climb.color) ? 'white' : 'black';
        
        const climbItem = document.createElement('div');
        climbItem.className = 'climb-item';
        climbItem.innerHTML = `
            <div class="climb-details">
                <div class="grade-badge" style="background-color: ${climb.color.toLowerCase()}; color: ${textColor};">
                    ${climb.grade}
                </div>
                <button class="delete-btn" onclick="deleteClimb(${index})">Delete</button>
            </div>
        `;
        climbList.appendChild(climbItem);
    });
}

function deleteClimb(index) {
    if (confirm('Are you sure you want to delete this climb?')) {
        const climbs = getClimbs();
        climbs.splice(index, 1); // Remove the climb at the specified index
        saveClimbs(climbs); // Update local storage
        renderClimbs(); // Re-render the climb list
    }
}

document.getElementById('add-climb-btn').addEventListener('click', addClimb);

// Helper function to determine text color
function shouldUseWhiteText(backgroundColor) {
    const darkColors = ['Blue', 'Red', 'Green', 'Purple', 'Black', 'Grey'];
    return darkColors.includes(backgroundColor);
}

function loadClimbs() {
    const climbList = document.querySelector('.climb-list');
    const climbs = JSON.parse(localStorage.getItem('climbs') || '[]');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter for today's climbs only
    const todayClimbs = climbs.filter(climb => climb.date.split('T')[0] === today);

    climbList.innerHTML = '';

    if (todayClimbs.length === 0) {
        const noClimbsMessage = document.createElement('p');
        noClimbsMessage.className = 'no-climbs';
        noClimbsMessage.textContent = 'No climbs logged today';
        climbList.appendChild(noClimbsMessage);
        return;
    }

    todayClimbs.forEach(climb => {
        const climbItem = document.createElement('div');
        climbItem.className = 'climb-item';

        const details = document.createElement('div');
        details.className = 'climb-details';

        const gradeDiv = document.createElement('div');
        gradeDiv.className = 'grade-badge';
        gradeDiv.textContent = climb.grade;
        gradeDiv.style.backgroundColor = '#007bff';
        gradeDiv.style.color = 'white';

        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'color-indicator';
        const colorSpan = document.createElement('span');
        colorSpan.style.width = '20px';
        colorSpan.style.height = '20px';
        colorSpan.style.backgroundColor = climb.color;
        colorSpan.style.borderRadius = '50%';
        colorSpan.style.display = 'inline-block';
        if (climb.color.toLowerCase() === 'white') {
            colorSpan.style.border = '1px solid #ccc';
        }
        colorIndicator.appendChild(colorSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteClimb(climb);

        details.appendChild(gradeDiv);
        details.appendChild(colorIndicator);
        climbItem.appendChild(details);
        climbItem.appendChild(deleteBtn);
        climbList.appendChild(climbItem);
    });
}
