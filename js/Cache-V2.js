class iDB {
    constructor(db_name) {
        this.db_name = db_name;
        this.database = null;
        this.version = 1;
    }
    //method primarily used to update the javascript values to match the current version
    async init() {
        var that = this;

        var promise = new Promise(function(resolve, reject) {

           var req = indexedDB.open(that.db_name, that.version);

           req.onupgradeneeded = function(event) {
               that.database = event.target.result;
               //run callback method in createTable to add a new object table
               that.upgrade();
           };

           req.onsuccess = function (event) {
               that.database = event.target.result;
               resolve();
           };

           req.onerror = function (error) {
               if (req.error.name === "VersionError") {
                   //we can never be sure what version of the database the client is on
                   //therefore in the event that we request an older version of the db than the client is on, we will need to update the js version request on runtime
                   that.version++;

                   //we need to initiate a steady increment of promise connections that either resolve or reject
                   that.init()
                       .then(function() {
                           //bubble the result
                            resolve();
                       })
                       .catch(function() {
                           //bubble the result: DOESNT WORK?
                           reject();
                       });
               } else {
                   console.error(error);
               }
           };
        });
        return promise;
    }
    async createTable(object) {
        //function will have to return a promise...
        return new Promise(resolve => {
            //if object is not a class, reject
            if (!Validator.isClass(object)) throw new iDB_Error(iDB_Error.classError);
            //check if in database already

            //in order to add a table to the database the db must be opened with a new version
            this.version++;
            if (this.database !== null && this.database !== undefined) {
                //restart
                this.restart()
                    .then(function() {
                        //this waits for the initiation to resolve before passing the okay back to create table
                        resolve();
                    });
            }
            //upgrade function override for specific upgrades to the db
            this.upgrade = function() {
                if (Validator.isFunction(object)) {
                    //If object constructor passed instantiate to get properties
                    object = new object();
                }
                this.database.createObjectStore(object.constructor.name, {keyPath: "id"})
            };
        });

    }
    upgrade() {
        //enter any required database store setup here || override before init() iDB Object
    }
    restart() {
        this.close();
        return this.init();
    }
    //close the held database connection
    close() {
        if (this.database !== null && this.database !== undefined) {
            this.database.close();
        }
    }
    getAll(object) {
        //complete validation checks on the object being passed
        if (!Validator.isClass(object)) throw new iDB_Error(iDB_Error.classError);
        if (Validator.isFunction(object)) object = new object();

        var objectStore = this.database.transaction(object.constructor.name).objectStore(object.constructor.name);
        var controller = objectStore.openCursor();
        controller.onsuccess = function(event) {
            var result = event.target.result;
            if (result){
                console.log(result.key);
                console.log(result.value);
            }
        }
    }
    add(object) {
        //complete validation checks on the object being passed
        if (!Validator.isClass(object)) throw new iDB_Error(iDB_Error.classError);
        if (!Validator.isInstanceOfDefinedClass(object)) throw new iDB_Error(iDB_Error.undefinedObject);

        //object needs id to be added, if id does not exist, make a new unique entry
        var id = object['id'];
        if (id === undefined) object['id'] = Generator.uuidv4();

        var req = this.database.transaction([object.constructor.name], "readwrite").objectStore(object.constructor.name)
            .add(object);
    }
}

class iDB_Error extends Error {
    constructor(message) {
        super(message);
        this.name = "indexedDB Error";

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, iDB_Error);
        }
    }
}
iDB_Error.classError = "The input provided is not a valid object";
iDB_Error.objectError = "This store already exists in Database";
iDB_Error.undefinedObject = "Please instantiate object with meaningful data before committing to indexedDB";