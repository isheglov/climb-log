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
    climbs.unshift({ date, grade: selectedGrade, color: selectedColor }); // Add to the beginning
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
    climbList.innerHTML = '<h2>Your Climbs today</h2>';
    const climbs = getClimbs();

    if (climbs.length === 0) {
        climbList.innerHTML += '<p class="no-climbs">No climbs logged yet.</p>';
        return;
    }

    climbs.forEach((climb, index) => {
        // Calculate text color based on background color
        const textColor = shouldUseWhiteText(climb.color) ? 'white' : 'black';
        
        const climbItem = document.createElement('div');
        climbItem.className = 'climb-item';
        climbItem.innerHTML = `
            <div class="climb-details">
                <button class="grade-btn" style="background-color: ${climb.color.toLowerCase()}; color: ${textColor};">
                    ${climb.grade}
                </button>
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
