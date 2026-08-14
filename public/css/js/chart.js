const canvas = document.getElementById("attendanceChart");
const pctx = document.getElementById("performanceChart");

if (pctx) {

    new Chart(pctx, {

        type: "bar",

        data: {

            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

            datasets: [{

                label: "Average Marks",

                data: [72, 81, 76, 88, 91, 85],

                backgroundColor: [
                    "#0ea5e9",
                    "#00d084",
                    "#ff6b6b",
                    "#f9a826",
                    "#00bcd4",
                    "#9c27b0"
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },

            scales: {
                x: {
                    ticks: { color: "white" }
                },
                y: {
                    ticks: { color: "white" }
                }
            }

        }

    });

}

if (canvas) {

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: "line",

        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

            datasets: [

                {
                    label: "Present",
                    data: [5, 4, 8, 5, 7, 4, 6],
                    borderColor: "#00ff88",
                    backgroundColor: "rgba(0,255,136,.18)",
                    fill: true,
                    tension: .4
                },

                {
                    label: "Absent",
                    data: [2, 3, 4, 2, 4, 2, 3],
                    borderColor: "#ff3b5c",
                    backgroundColor: "rgba(255,59,92,.15)",
                    fill: true,
                    tension: .4
                }

            ]

        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }

    });

}