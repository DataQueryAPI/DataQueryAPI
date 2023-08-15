<img src="https://ik.imagekit.io/serenity/ByteofDev/Blog_Heading_Images/State_of_the_Web_Deno" alt="Deno" width="250px" style="border-radius: 12px;">
  
# DataQueryAPI Module

The `DataQueryAPI` module is a TypeScript class that provides methods for querying and manipulating data. It offers functionalities for filtering, sorting, limiting, selecting, grouping, inserting, updating, and deleting data items. This module is designed to work with Deno, a secure runtime for JavaScript and TypeScript.

### Next Features

- Supporting YAML
- Supporting XML

## Installation

To use the `DataQueryAPI` module in your Deno project, you can import it as follows:

```typescript
import DataQueryAPI from "https://deno.land/x/dataqueryapi/mod.ts";
```

## Usage

Here's a quick overview of the features provided by the `DataQueryAPI` module:

### Creating an Instance

You can create an instance of the `API` class by providing either an initial data array or a file path containing JSON data:

```typescript
import DataQueryAPI from "https://deno.land/x/dataqueryapi/mod.ts";

const initialData = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  // ...
];

const api = new DataQueryAPI(initialData);

// Or load data from a file
const apiFromFile = new DataQueryAPI("./data.json");
```

### Querying Data

You can perform advanced queries on the data using the `query` method. The query can include filtering, sorting, limiting, and selecting options:

```typescript
const query = {
  filter: { age: { $gt: 25 } },
  sort: { by: "age", order: "desc" },
  limit: 10,
  select: ["id", "name"],
};

const filteredData = api.query(query);
```

### Getting Data by ID

Retrieve a specific data item by its ID using the `getById` method:

```typescript
const item = api.getById(1); // Returns the item with ID 1
```

### Counting Data

Count the total number of data items or the number of items that match a specific query:

```typescript
const totalCount = api.count();
const filteredCount = api.count({ age: { $gt: 25 } });
```

### Grouping Data

Group data items by a specified field:

```typescript
const groupedData = api.groupBy("age");
```

### Inserting Data

Insert new data items into the array:

```typescript
const newItem = { id: 3, name: "Charlie", age: 28 };
api.insert(newItem);
```

### Updating Data

Update existing data items based on a filter:

```typescript
const updateFilter = { id: 2 };
const updateData = { age: 26 };
api.update(updateFilter, updateData);
```

### Deleting Data

Delete data items based on a filter:

```typescript
const deleteFilter = { age: { $lt: 30 } };
api.delete(deleteFilter);
```

### Saving Data

Save data to a JSON file:

```typescript
api.save(); // If data is an array, it will be saved to the original file path
api.save("./newData.json"); // Save data to a specific file path
```

## License

This module is distributed under the XYZ License. See [LICENSE](./LICENSE) for more information.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
