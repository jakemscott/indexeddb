class Validator {
    static isInteger(data) {
        var x;
        if (isNaN(data)) return false;
        x = parseFloat(data);
        return (x | 0) === x;
    }
    static isFloat(data) {
        if (isNaN(data)) {
            return false;
        } else {
            return Number(data) === data && data % 1 !== 0;
        }
    }
    static isFunction(data) {
        return data && [].toString.call(data) === '[object Function]';
    }
    static isClass(data) {
        // if data is a function, check to make sure function is not a constructor
        //An ES6 class constructor can still slip through here if uninitiated
        //therefore inspect constructor for class declaration
        if (Validator.isFunction(data) && !(/^\s*class\s+/.test(data.toString()))) {
            return false;
        } else {
            // data must be an instance of an object, cannot be a simple variable
            return data instanceof Object;
        }
    }
    static isInstanceOfDefinedClass(data) {
        // eliminate any functions
        if (Validator.isFunction(data)) {
            return false;
        } else {
            var check = false;
            //check that value is a class and not a variable
            if (Validator.isClass(data)) {
                //loop through each of the classes properties and determine if any values have been assigned to its properties
                for (var property in data) {
                    if (data.hasOwnProperty(property)){
                        if (typeof data[property] !== 'undefined') {
                            //found a defined variable, constructor is more than a simple class and holds meaningful data
                            check = true;
                            //prevent unnecessary computation
                            break;
                        }
                    }
                }
            }
            return check;
        }
    }
}