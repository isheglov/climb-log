// Function to get climbing data from localStorage
function getClimbingData() {
    const climbs = JSON.parse(localStorage.getItem('climbs')) || [];
    
    // Group climbs by date and calculate average grade
    const groupedData = climbs.reduce((acc, climb) => {
        const date = climb.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                grades: [],
                count: 0
            };
        }
        acc[date].grades.push(parseFloat(climb.grade));
        acc[date].count++;
        return acc;
    }, {});

    // Calculate maximum grade and format for Chart.js
    const chartData = Object.entries(groupedData).map(([date, data]) => ({
        x: date,
        y: Math.max(...data.grades)
    }));

    return chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
}

// Function to get climb count data from localStorage
function getClimbCountData() {
    const climbs = JSON.parse(localStorage.getItem('climbs')) || [];

    // Group climbs by date and count climbs
    const groupedData = climbs.reduce((acc, climb) => {
        const date = climb.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                count: 0
            };
        }
        acc[date].count++;
        return acc;
    }, {});

    // Format for Chart.js
    const chartData = Object.entries(groupedData).map(([date, data]) => ({
        x: date,
        y: data.count
    }));

    return chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
}

// Create and render the graph
function renderGraph() {
    const ctxGrade = document.getElementById('climbingGraph').getContext('2d');
    const ctxCount = document.getElementById('climbCountGraph').getContext('2d'); // Get context for the new chart
    const gradeData = getClimbingData();
    const countData = getClimbCountData(); // Get data for climb count

    new Chart(ctxGrade, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Highest Climbing Grade',
                data: gradeData,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Grade'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Climbing Progress Over Time'
                }
            }
        }
    });

    new Chart(ctxCount, { // Render the new chart
        type: 'bar', // Changed to bar chart for count
        data: {
            datasets: [{
                label: 'Number of Climbs per Session',
                data: countData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)', // Example color
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Climbs Count'
                    },
                    beginAtZero: true, // Start y-axis from 0 for count
                    stepSize: 1 // Ensure integer steps for climb count
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Climbs per Session Over Time' // Updated title
                }
            }
        }
    });
}

// Initialize the graph when the page loads
document.addEventListener('DOMContentLoaded', renderGraph); 
