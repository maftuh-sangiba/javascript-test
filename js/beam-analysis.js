'use strict';

/** ============================ Beam Analysis Data Type ============================ */

/**
 * Beam material specification.
 *
 * @param {String} name         Material name
 * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
 */
function Material(name, properties) {
    this.name = name;
    this.properties = properties;
}

/**
 *
 * @param {Number} primarySpan          Beam primary span length
 * @param {Number} secondarySpan        Beam secondary span length
 * @param {Material} material           Beam material object
 */
function Beam(primarySpan, secondarySpan, material) {
    this.primarySpan = primarySpan;
    this.secondarySpan = secondarySpan;
    this.material = material;
}

/** ============================ Beam Analysis Class ============================ */

function BeamAnalysis() {
    this.options = {
        condition: 'simply-supported'
    };

    this.analyzer = {
        'simply-supported': new BeamAnalysis.analyzer.simplySupported(),
        'two-span-unequal': new BeamAnalysis.analyzer.twoSpanUnequal()
    };
}

BeamAnalysis.prototype = {
    /**
     *
     * @param {Beam} beam
     * @param {Number} load
     */
    getDeflection: function (beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getDeflectionEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    },

    getBendingMoment: function (beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getBendingMomentEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    },

    getShearForce: function (beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getShearForceEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
};



/** ============================ Beam Analysis Analyzer ============================ */

/**
 * Available analyzers for different conditions
 */
BeamAnalysis.analyzer = {};

/**
 * Calculate deflection, bending stress and shear stress for a simply supported beam
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.simplySupported = function (beam, load) {
    this.beam = beam;
    this.load = load;
};

BeamAnalysis.analyzer.simplySupported.prototype = {
    getDeflectionEquation: function (beam, load) {
        const { primarySpan } = beam;
        const { EI, j2 } = beam.material.properties;

        const step = primarySpan / 10;
        const xValues = [];
        const vValues = [];

        for (let i = 0; i <= primarySpan; i += step) {
            const x = parseFloat(i.toFixed(1));
            xValues.push(x);

            const V = -((load * x) / (24 * EI)) * (Math.pow(primarySpan, 3) - 2 * primarySpan * Math.pow(x, 2) + Math.pow(x, 3)) * j2 * 1000;
            vValues.push(parseFloat((V * 1000000000).toFixed(1)));
        }

        return {
            x: xValues,
            y: vValues,
        }
    },

    getBendingMomentEquation: function (beam, load) {
        const { primarySpan } = beam;

        const step = primarySpan / 10;
        const xValues = [];
        const vValues = [];

        for (let i = 0; i <= primarySpan; i += step) {
            const x = parseFloat(i.toFixed(1));
            xValues.push(x);

            const V = (load * x / 2) * ((primarySpan - x)) * -1;
            vValues.push(parseFloat(V.toFixed(1)));
        }

        return {
            x: xValues,
            y: vValues,
        }
    },

    getShearForceEquation: function (beam, load) {
        const { primarySpan } = beam;

        const step = primarySpan / 10;
        const xValues = [];
        const vValues = [];

        for (let i = 0; i <= primarySpan; i += step) {
            const x = parseFloat(i.toFixed(1));
            xValues.push(x);

            const V = load * ((primarySpan / 2) - x);
            vValues.push(parseFloat(V.toFixed(1)));
        }

        return {
            x: xValues,
            y: vValues,
        }
    }
};

/**
 * Calculate deflection, bending stress and shear stress for a beam with two spans of equal condition
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.twoSpanUnequal = function (beam, load) {
    this.beam = beam;
    this.load = load;
};

BeamAnalysis.analyzer.twoSpanUnequal.prototype = {
    getDeflectionEquation: function (beam, load) {
        return function (x) {
            return {
                x: x,
                y: null
            };
        }
    },

    getBendingMomentEquation: function (beam, load) {
        return function (x) {
            return {
                x: x,
                y: null
            };
        }
    },

    getShearForceEquation: function (beam, load) {
        const { primarySpan, secondarySpan } = beam;
        const { EI, j2 } = beam.material.properties;

        const totalLength = primarySpan + secondarySpan;
        const M1 = -((load * Math.pow(secondarySpan, 3)) + (load * Math.pow(primarySpan, 3))) / (8 * (primarySpan + secondarySpan));
        const R1 = (M1 / primarySpan) + ((load * primarySpan) / 2);
        const R3 = (M1 / secondarySpan) + ((load * secondarySpan) / 2);
        const R2 = (load * primarySpan) + (load * secondarySpan) - R1 - R3;
        const results = []
        const resultsV = []

        let i = 0
        let isCounting = true

        while (isCounting) {
            let x = 0
            const previousX = results[i - 1] || 0
            const previousXtwice = results[i - 2]

            if (i == 0) {
                x = 0
            } else if (previousX === 0) {
                x = previousX + (totalLength / 10);
            } else if (Math.abs(previousX - primarySpan) <= (totalLength / 10) && previousX - primarySpan < 0) {
                x = primarySpan;
            } else if (previousX - primarySpan === 0 && Math.abs(previousXtwice - primarySpan) <= (totalLength / 10) && previousXtwice !== previousX) {
                x = primarySpan;
            } else if (Math.abs(previousX - totalLength) < (totalLength / 10)) {
                x = totalLength;
            } else {
                x = previousX + (totalLength / 10);
            }

            results.push(x);

            const currentKey = x
            const previousKey = results[i - 1] || 0
            const nextKey = results[i + 1] || 0
            const previousTwoKey = results[i - 2] || 0

            if (i > 0) {
                resultsV[i - 1] = countV({ currentKey: previousKey, previousKey: previousTwoKey, nextKey: currentKey })
            }

            isCounting = x < totalLength

            if (!isCounting) {
                resultsV[i] = countV({ currentKey, previousKey, nextKey })
            }

            i++
        }

        function countV({ currentKey, previousKey, nextKey }) {

            if (currentKey === 0) {
                return rounded(R1);
            } else if (currentKey === totalLength) {
                return rounded((R1 + R2) - (load * totalLength));
            } else if (currentKey === primarySpan && previousKey - primarySpan < 0) {
                return rounded(R1 - (load * primarySpan));
            } else if (currentKey === primarySpan && nextKey - primarySpan > 0) {
                return rounded((R1 + R2) - (load * primarySpan));
            } else if (currentKey < primarySpan) {
                return rounded(R1 - (load * currentKey));
            } else {
                return rounded((R1 + R2) - (load * currentKey));
            }
        }

        function rounded(x) {
            return Number(x).toFixed(2)
        }

        console.log({ results, resultsV });

        return {
            x: results,
            y: resultsV
        };
    }
};
