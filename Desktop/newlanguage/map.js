function BhaiMap() {
    this.items = {};  // Use an object to store key-value pairs
    this.size = 0;    // Keep track of the number of entries in the map
  }
  
  // Method to set a key-value pair
  BhaiMap.prototype.set = function(key, value) {
    if (!this.has(key)) {
      this.size++;  // Increment size if the key is new
    }
    this.items[key] = value;  // Add or update the key-value pair
  };
  
  // Method to get the value by key
  BhaiMap.prototype.get = function(key) {
    return this.has(key) ? this.items[key] : undefined;
  };
  
  // Method to check if a key exists in the map
  BhaiMap.prototype.has = function(key) {
    // Check if the key exists in the items object
    return Object.prototype.hasOwnProperty.call(this.items, key);
  };
  
  // Method to delete a key-value pair by key
  BhaiMap.prototype.delete = function(key) {
    if (this.has(key)) {
      delete this.items[key];  // Delete the key-value pair
      this.size--;  // Decrement size
      return true;
    }
    return false;
  };
  
  // Method to clear all key-value pairs
  BhaiMap.prototype.clear = function() {
    this.items = {};  // Reset the items object
    this.size = 0;    // Reset the size
  };
  
  // Method to get the number of key-value pairs in the map
  BhaiMap.prototype.getSize = function() {
    return this.size;
  };
  
  // Method to iterate over each key-value pair and execute a callback function
  BhaiMap.prototype.forEach = function(callback, thisArg) {
    for (let key in this.items) {
      if (this.has(key)) {
        callback.call(thisArg, this.items[key], key, this);
      }
    }
  };
  
  // Method to get all keys in the map as an array
  BhaiMap.prototype.keys = function() {
    return Object.keys(this.items);
  };
  
  // Method to get all values in the map as an array
  BhaiMap.prototype.values = function() {
    return Object.values(this.items);
  };
  
  // Method to get all entries in the map as an array of [key, value] pairs
  BhaiMap.prototype.entries = function() {
    return Object.entries(this.items);
  };
  
  // Example usage:
  const myMap = new BhaiMap();
  
  // Add key-value pairs
  myMap.set('name', 'John');
  myMap.set('age', 30);
  myMap.set('job', 'Developer');
  
  console.log('Get name:', myMap.get('name')); // Output: 'Get name: John'
  console.log('Has age:', myMap.has('age'));  // Output: 'Has age: true'
  console.log('Size of map:', myMap.getSize());  // Output: 'Size of map: 3'
  
  // Iterate over entries
  myMap.forEach(function(value, key) {
    console.log(`${key}: ${value}`);
  });
  // Output:
  // name: John
  // age: 30
  // job: Developer
  
  // Get keys, values, and entries
  console.log('Keys:', myMap.keys());  // Output: 'Keys: [ 'name', 'age', 'job' ]'
  console.log('Values:', myMap.values());  // Output: 'Values: [ 'John', 30, 'Developer' ]'
  console.log('Entries:', myMap.entries());  // Output: 'Entries: [ [ 'name', 'John' ], [ 'age', 30 ], [ 'job', 'Developer' ] ]'
  
  // Delete a key
  myMap.delete('age');
  console.log('Size after delete:', myMap.getSize());  // Output: 'Size after delete: 2'
  
  // Clear all entries
  myMap.clear();
  console.log('Size after clear:', myMap.getSize());  // Output: 'Size after clear: 0'
  