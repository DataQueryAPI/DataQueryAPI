// deno-lint-ignore-file no-explicit-any
import { Data, Query } from "./types.ts";

/* The API class is a TypeScript class that provides methods for querying and manipulating data. */
class DataQueryAPI {
  private data: Data;
  private filepath?: string;

  /**
   * The constructor function initializes the data property of an object either by reading a file and
   * parsing its content as JSON, or by directly assigning the provided data.
   * @param {Data | string} data - The `data` parameter can be either of type `Data` or `string`.
   */
  constructor(data: Data | string) {
    if (typeof data === "string") {
      this.filepath = data;
      const fileContent = Deno.readTextFileSync(data);
      if (fileContent.trim() === "") {
        this.data = [];
      } else {
        this.data = JSON.parse(fileContent);
      }
    } else {
      this.data = data;
    }
  }

  /**
   * The function `applyFilter` takes an item and a filter object as input and returns a boolean value
   * indicating whether the item matches the filter criteria.
   * @param item - An object representing an item that needs to be filtered.
   * @param filter - The `filter` parameter is an object that represents the filtering criteria. It can
   * have various properties such as ``, ``, ``, and other comparison operators like ``,
   * ``, ``, ``, ``, ``, and ``. The `apply
   * @returns a boolean value.
   */
  applyFilter(item: { [key: string]: any }, filter: Query["filter"]): boolean {
    if (!filter) {
      return false;
    }

    if (filter.$and) {
      return filter.$and.every((cond) => this.applyFilter(item, cond));
    }

    if (filter.$or) {
      return filter.$or.some((cond) => this.applyFilter(item, cond));
    }

    if (filter.$not) {
      return !this.applyFilter(item, filter.$not);
    }

    for (const key in filter) {
      const filterValue = filter[key];
      const itemValue = item[key];

      if (typeof filterValue === "object") {
        if (filterValue.$eq !== undefined && itemValue !== filterValue.$eq) {
          return false;
        }
        if (filterValue.$ne !== undefined && itemValue === filterValue.$ne) {
          return false;
        }
        if (filterValue.$gt !== undefined && !(itemValue > filterValue.$gt)) {
          return false;
        }
        if (filterValue.$lt !== undefined && !(itemValue < filterValue.$lt)) {
          return false;
        }
        if (
          filterValue.$gte !== undefined && !(itemValue >= filterValue.$gte)
        ) {
          return false;
        }
        if (
          filterValue.$lte !== undefined && !(itemValue <= filterValue.$lte)
        ) {
          return false;
        }
        if (
          filterValue.$regex instanceof RegExp &&
          !filterValue.$regex.test(itemValue)
        ) {
          return false;
        }
      } else {
        if (itemValue !== filterValue) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * The function takes a query object as input and applies filtering, sorting, limiting, and selecting
   * operations on a data array, returning the resulting data.
   * @param {Query} query - The `query` parameter is an object that contains various properties for
   * filtering, sorting, limiting, and selecting data. It has the following properties:
   * @returns the filtered, sorted, limited, and selected data based on the provided query.
   */
  query(query: Query): Data {
    let result = [...this.data];
    const filter = query.filter || {};

    if (Object.keys(filter).length > 0) {
      result = result.filter((item) => this.applyFilter(item, filter));
    }

    if (query.sort) {
      const { by, order } = query.sort;
      result.sort((a, b) => {
        const aValue = a[by];
        const bValue = b[by];
        if (order === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    if (query.limit !== undefined) {
      result = result.slice(0, query.limit);
    }

    if (query.select) {
      result = result.map((item) => {
        const selectedItem: { [key: string]: any } = {};
        if (query.select) {
          for (const key of query.select) {
            if (item[key] !== undefined) {
              selectedItem[key] = item[key];
            }
          }
        }
        return selectedItem;
      });
    }

    return result;
  }

  /**
   * The function getById takes an id parameter and returns an object from the data array that has a
   * matching id, or undefined if no match is found.
   * @param {any} id - The `id` parameter is of type `any`, which means it can accept any data type.
   * @returns an object with key-value pairs or undefined.
   */
  getById(id: any): { [key: string]: any } | undefined {
    return this.data.find((item) => item.id === id);
  }

  /**
   * The `count` function returns the number of elements in the data array, or the number of elements
   * that match a given query.
   * @param {Query} [query] - The `query` parameter is an optional parameter of type `Query`. It
   * represents a query object that can be used to filter the data. If no query is provided, the
   * function will return the total count of all the data items. If a query is provided, the function
   * will return the count of
   * @returns The count of the filtered data based on the given query.
   */
  count(query?: Query): number {
    if (!query) {
      return this.data.length;
    }

    const filteredData = this.query(query);
    return filteredData.length;
  }

  /**
   * The function groups an array of data objects based on a specified field and returns an object
   * where the keys are unique values of the field and the values are arrays of data objects with that
   * field value.
   * @param {string} field - The "field" parameter is a string that represents the property of the
   * "Data" objects that you want to group by.
   * @returns an object where the keys are strings and the values are arrays of Data objects.
   */
  groupBy(field: string): { [key: string]: Data } {
    const groupedData: { [key: string]: Data } = {};

    for (const item of this.data) {
      const value = item[field];
      if (!groupedData[value]) {
        groupedData[value] = [];
      }
      groupedData[value].push(item);
    }

    return groupedData;
  }

  /**
   * The insert function adds an item to an array.
   * @param item - The `item` parameter is an object with key-value pairs. The keys are strings and the
   * values can be of any type.
   */
  insert(items: { [key: string]: any }): void {
    if (Array.isArray(this.data)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          this.data.push(item);
        }
      } else {
        this.data.push(items);
      }
    } else {
      throw new Error("Cannot insert into a file-based data source.");
    }
  }

  /**
   * The function updates the data by applying a filter and merging the update data with the matching
   * items.
   * @param filter - The "filter" parameter is an object that specifies the criteria for filtering the
   * data. It can contain one or more key-value pairs, where each key represents a property of the data
   * item and the corresponding value represents the desired value for that property.
   * @param updateData - An object containing key-value pairs representing the data to be updated. The
   * keys are strings and the values can be of any type.
   */
  update(filter: Query["filter"], updateData: { [key: string]: any }): void {
    this.data = this.data.map((item) => {
      if (this.applyFilter(item, filter)) {
        return { ...item, ...updateData };
      }
      return item;
    });
  }

  /**
   * The delete function filters out items from the data array based on the provided filter.
   * @param filter - The "filter" parameter is a query object that specifies the conditions for
   * filtering the data. It can contain properties such as "field" to specify the field to filter on,
   * "operator" to specify the comparison operator, and "value" to specify the value to compare
   * against.
   */
  delete(filter: Query["filter"]): void {
    this.data = this.data.filter((item) => !this.applyFilter(item, filter));
  }

  /**
   * The `save` function saves data to a file in JSON format, either specified by the `file` parameter
   * or using the `filepath` property of the object.
   * @param {string} [file] - The `file` parameter is an optional string that represents the file path
   * where the data will be saved. If provided, the data will be saved to the specified file.
   * @returns If the `file` parameter is not provided and the `data` property is an array, then a
   * resolved promise is returned. Otherwise, if none of the conditions are met, an error is thrown.
   */
  save(file?: string) {
    if (file) {
      Deno.writeTextFileSync(file, JSON.stringify(this.data, null, 2));
    } else if (this.filepath) {
      const jsonString = JSON.stringify(this.data, null, 2);
      Deno.writeTextFileSync(this.filepath, jsonString);
    } else if (Array.isArray(this.data)) {
      return Promise.resolve();
    } else {
      throw new Error("Invalid data type.");
    }
  }
}

export default DataQueryAPI;
