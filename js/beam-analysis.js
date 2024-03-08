'use strict';

/** ============================ Beam Analysis Data Type ============================ */

/**
 * Beam material specification.
 *
 * @param {String} name         Material name
 * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
 */
function Material (name, properties) {
    this.name       = name;
    this.properties = properties;
}

/**
 *
 * @param {Number} primarySpan          Beam primary span length
 * @param {Number} secondarySpan        Beam secondary span length
 * @param {Material} material           Beam material object
 */
function Beam (primarySpan, secondarySpan, material) {
    this.primarySpan    = primarySpan;
    this.secondarySpan  = secondarySpan;
    this.material       = material;
}

/** ============================ Beam Analysis Class ============================ */

function BeamAnalysis () {
    this.options = {
        condition : 'simply-supported'
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
        var w = load;
        var L = beam.primarySpan;
        var EI = beam.material.properties.EI;
        var j2 = beam.material.properties.j2;

        function parseNilai(num) {
            return parseFloat((num).toFixed(1));
        }

        const step = parseNilai((L / 10));

        const xValues = [];

        for (let i = 0; i <= L; i += step) {
            xValues.push(parseNilai(i));
        }

        const vValues = [];

        xValues.forEach((x) => {
            const V = -((w * x) / (24 * EI)) * (Math.pow(L, 3) - 2 * L * Math.pow(x, 2) + Math.pow(x, 3)) * j2 * 1000;
            vValues.push(parseFloat(V * 1000000000));
        });

        return {
            x: xValues,
            y: vValues,
        }
    },

    getBendingMomentEquation: function (beam, load) {
        var w = load;
        var L = beam.primarySpan;

        function parseNilai(num) {
            return parseFloat((num).toFixed(1));
        }

        const step = parseNilai((L / 10));

        const xValues = [];

        for (let i = 0; i <= L; i += step) {
            xValues.push(parseNilai(i));
        }

        const vValues = [];

        xValues.forEach((x) => {
            const V = ((w * x / 2) * ((L - x)) * -1);
            vValues.push(parseNilai(V));
        });

        return {
            x: xValues,
            y: vValues,
        }
    },

    getShearForceEquation: function (beam, load) {
        var w = load;
        var L = beam.primarySpan;

        function parseNilai(num) {
            return parseFloat((num).toFixed(1));
        }

        const step = parseNilai((L / 10));

        const xValues = [];

        for (let i = 0; i <= L; i += step) {
            xValues.push(parseNilai(i));
        }

        const vValues = [];

        xValues.forEach((x) => {
            const V = w * ((L / 2) - x);
            vValues.push(parseNilai(V));
        });

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
        return function (x) {
            return {
                x: x,
                y: null
            };
        }
    }
};
