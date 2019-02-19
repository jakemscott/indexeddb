class ArrayUtil extends Array {
    constructor() {
        super();
    }
    contains(value) {
        var found = false;
        for (var i =0; i<this.length; i++) {
            if (this[i] === value) {
                found = true;
                break;
            }
        }
        return found;
    }
}
