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
            case 'shear_force_plot':
                DrawShearChart(this.container, data.equation.x, data.equation.y);
                break;
            case 'deflection_plot':
                DrawDeflectionChart(this.container, data.equation.x, data.equation.y);
                break;
            case 'bending_moment_plot':
                DrawBendingChart(this.container, data.equation.x, data.equation.y);
                break;
            default:
                break;
        }
    },
};
function DrawDeflectionChart(container, x, y) {
    var ctx = document.getElementById(container).getContext('2d');
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
                cubicInterpolationMode: 'monotone'
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
                        text: 'Span (m)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Deflection (kN)'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function DrawShearChart(container, x, y) {
    var ctx = document.getElementById(container).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                data: y,
                borderColor: 'red',
                borderWidth: 1,
                fill: true,
                pointRadius: 0
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
                        text: 'Span (m)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Shear Force (kN)'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function DrawBendingChart(container, x, y) {
    var ctx = document.getElementById(container).getContext('2d');
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
                cubicInterpolationMode: 'monotone'
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
                        text: 'Span (m)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Bending Moment (kNm)'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}