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

    // Calculate averages and format for Chart.js
    const chartData = Object.entries(groupedData).map(([date, data]) => ({
        x: date,
        y: data.grades.reduce((a, b) => a + b, 0) / data.grades.length
    }));

    return chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
}

// Create and render the graph
function renderGraph() {
    const ctx = document.getElementById('climbingGraph').getContext('2d');
    const data = getClimbingData();

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Average Climbing Grade',
                data: data,
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
}

// Initialize the graph when the page loads
document.addEventListener('DOMContentLoaded', renderGraph); 
