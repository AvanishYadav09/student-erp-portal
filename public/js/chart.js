document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("attendanceChart");
    const pctx = document.getElementById("performanceChart");

    if (pctx) {
        // Read monthly data from data attributes if present, otherwise default
        const labelsAttr = pctx.getAttribute("data-labels");
        const valuesAttr = pctx.getAttribute("data-values");
        
        const labels = labelsAttr ? JSON.parse(labelsAttr) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const dataValues = valuesAttr ? JSON.parse(valuesAttr) : [72, 81, 76, 88, 91, 85];

        new Chart(pctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Average Marks (%)",
                    data: dataValues,
                    backgroundColor: [
                        "#0ea5e9",
                        "#00d084",
                        "#ff6b6b",
                        "#f9a826",
                        "#00bcd4",
                        "#9c27b0"
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: "var(--text-primary)" }
                    }
                },
                scales: {
                    x: { ticks: { color: "var(--text-secondary)" }, grid: { display: false } },
                    y: { ticks: { color: "var(--text-secondary)" }, grid: { color: "rgba(255, 255, 255, 0.05)" }, min: 0, max: 100 }
                }
            }
        });
    }

    if (canvas) {
        const ctx = canvas.getContext("2d");

        // Read attendance data from data attributes if present
        const presVal = canvas.getAttribute("data-present") ? parseInt(canvas.getAttribute("data-present")) : 7;
        const absVal = canvas.getAttribute("data-absent") ? parseInt(canvas.getAttribute("data-absent")) : 2;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Present",
                        data: [Math.max(1, presVal - 2), Math.max(1, presVal - 3), presVal + 1, Math.max(1, presVal - 1), presVal + 2, presVal, presVal],
                        borderColor: "#00ff88",
                        backgroundColor: "rgba(0,255,136,.18)",
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: "Absent",
                        data: [absVal, Math.max(0, absVal + 1), absVal, Math.max(0, absVal - 1), absVal + 1, absVal, Math.max(0, absVal - 1)],
                        borderColor: "#ff3b5c",
                        backgroundColor: "rgba(255,59,92,.15)",
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "var(--text-primary)" } }
                },
                scales: {
                    x: { ticks: { color: "var(--text-secondary)" }, grid: { display: false } },
                    y: { ticks: { color: "var(--text-secondary)" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
                }
            }
        });
    }
});
