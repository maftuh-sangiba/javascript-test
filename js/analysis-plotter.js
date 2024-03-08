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
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Deflection (kN)', 'monotone');
                break;
            case 'shear_force_plot':
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Shear Force (kN)',);
                break;
            case 'bending_moment_plot':
                this.drawChart(data.equation.x, data.equation.y, 'Span (m)', 'Bending Moment (kNm)', 'monotone');
                break;
            default:
                break;
        }
    },

    drawChart(x, y, xAxisLabel, yAxisLabel, interpolationMode) {
        const ctx = document.getElementById(this.container).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: x,
                datasets: [{
                    data: y,
                    borderColor: 'red',
                    borderWidth: 1,
                    fill: true,
                    pointRadius: 0,
                    cubicInterpolationMode: interpolationMode || 'default'
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
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
};