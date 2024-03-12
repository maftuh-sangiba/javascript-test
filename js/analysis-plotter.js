'use strict';

/**
 * Plot result from the beam analysis calculation into a graph
 */
function AnalysisPlotter(container) {
    this.container = container;
}

AnalysisPlotter.prototype = {
    /**
     * Plot equation.
     *
     * @param {Object{beam : Beam, load : float, equation: Function}}  The equation data
     */
    plot: function (data) {
        console.log('Plotting data : ', data);

        switch (this.container) {
            case 'deflection_plot':
                this.destroyChart(this.container);
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Deflection (kN)', 'monotone');
                break;
            case 'shear_force_plot':
                this.destroyChart(this.container);
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Shear Force (kN)');
                break;
            case 'bending_moment_plot':
                this.destroyChart(this.container);
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Bending Moment (kNm)', 'monotone');
                break;
            default:
                break;
        }
    },

    drawChart(x, y, xAxisLabel, yAxisLabel, interpolationMode, container) {
        const ctx = document.getElementById(this.container).getContext('2d');
        const condition = document.getElementById("condition").value;
        const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
        const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
        
        let segmentOption;
        let borderColor = 'red';
        let backgroundColor;

        if (this.container === 'shear_force_plot') {
            segmentOption = {
                borderColor: ctx => skipped(ctx, 'rgba(0, 0, 0, 0)') || down(ctx, 'red'),
            }

            borderColor = 'rgba(0, 0, 0, 0)'
        }

        if (this.container === 'deflection_plot' && condition === "two-span-unequal") {
            backgroundColor = 'rgba(0, 0, 0, 0)';
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: x,
                datasets: [{
                    data: y,
                    borderColor: borderColor,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    cubicInterpolationMode: interpolationMode || 'default',
                    segment: segmentOption,
                    backgroundColor: backgroundColor,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxisLabel
                        },
                        type: "linear",
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel
                        },
                        type: "linear",
                        grace: "10%"
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    destroyChart(chartId) {
        var chartInstance = Chart.getChart(chartId);
        if (chartInstance) {
            chartInstance.destroy();
        }
    }
};