<h1>IndexedDB</h1>
This javascript project is an implementation of an easier to use indexeddb library for client side data storage.

This implementation focuses on javascript object persistence.

Basic usage is as follows:

```javascript
class Dog {
    constructor(name, ears) {
        this.name = name;
        this.age = age;
    }
}

var george = new Dog("George", 10);

db.init()
    .then(function() {
        try {
            db.createTable(Dog)
                .then(function() {
                    db.add(george);
                });
        } catch (e) {
            console.error(e);
        }
    });

```

Due to the async nature of the transaction you can see that a series of promises are returned for each function to ensure that each transaction occurs sequentially.