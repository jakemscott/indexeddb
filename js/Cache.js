class Cache {
    constructor(db_name) {
        //only hold reference to name as connection needs to established with each transaction
        this.database = db_name;
        this.tables = new ArrayUtil();
        this.version = 1;
    }

    //By default Cache persistence is created for objects this function establishes a new table based on the object provided
    init() {
        //in order to update the tables in the indexdb we need to change the version
        if (this.tables.length > 0 && !this.tables.contains(object.constructor.name)) {
            console.log("Incrementing version number");
            this.version++;
        }
        var that = this;
        var promise = new Promise(function(resolve, reject) {
            var requested_db = indexedDB.open(that.database, that.version);
            console.log("about to start upgrade request");
            requested_db.onupgradeneeded = function(event) {
                console.log("started update request");
                var database = event.result;
                that.version = event.newVersion;

                //set variables if not passed
                var table_name = object.constructor.name;
                if (persist === undefined) persist = true;
                if (object !== undefined) {
                    //if object does not contain its own id, generate a new uuid
                    var id = object['id'];
                    if (id === undefined) object['id'] = Generator.uuidv4();

                    var table = database.createObjectStore(table_name, {keyPath: "id"});

                    for (var property in object) {
                        if (object.hasOwnProperty(property)) {
                            //create a row for every property in object
                            table.createIndex(property, property);
                        }
                    }
                    //if persist this object is set to true, enter this property into db
                    if (persist) table.put(object);
                    //add object name to array
                    that.tables.push(object.constructor.name);
                }
            };
            console.log("about to start on success");
            requested_db.onsuccess = function(event) {
                var database = event.target.result;
                console.log("success fired");
                database.onversionchange = function (e) {
                    console.log("reveal your secrets");
                };
                database.onerror = function(event) {
                    console.log("AN ERROR");
                };
                database.close();
            };
            requested_db.onblocked = function(e) {
                console.log("Blocked" + e);
            };
            requested_db.onerror = function(event) {
                console.log(requested_db);
                if(requested_db.error.name === "VersionError") {
                    console.log("handle the version");
                }
            };
            resolve();
        });
        return promise;
    }

    addItem(object, property) {
        //create keypair
        var keypair = new Map();
        keypair.set(property, object[property]);
        var table_name = object.constructor.name;
        //retrieve table for writing
        var transaction = database.transaction(table_name, "readwrite");
        var table = transaction.objectStore(table_name);
        table.put(keypair);
    }
    closeCache() {
        this.database.close();
    }
}
Cache.READY = "CACHE_READY";