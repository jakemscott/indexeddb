//Specific methods for LWP to handle data
class LWP_Cache extends Cache {
    constructor(database) {
        super(database);
    }
    createObjectTable(cacheName, data) {
        var requested_db = indexedDB.open(this.database);

        requested_db.onupgradeneeded = function() {
            var database = requested_db.result;
            var store = database.createObjectStore(cacheName, {keyPath: "key"});
            store.createIndex("by_key", "key", {unique: true});
            store.createIndex("by_data", "data");

            //import all passed data to new database
            for (var i = 0; i < data.length; i++) {
                store.put({key: data[i].id, data: JSON.stringify(data[i])});
            }
        }
    }
}