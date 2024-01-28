// give an input of objects list with multiple items at the same value of `groupByField`
// this function helps to group all items on the same value of `groupByField`
// into one item and sum all fields of every item
//
// for example and usages, please refer to test cases
export function groupAndSumObjectList(items: Array<any>, groupByField: string): Array<any> {
  const groupedItems: Array<any> = [];

  const groupByFields: {
    [key: string]: {
      [key: string]: number;
    };
  } = {};

  for (const item of items) {
    const groupFieldValue = item[groupByField];

    // get a list of available keys
    const fields = Object.keys(item);

    for (const field of fields) {
      if (field !== groupByField) {
        if (!groupByFields[groupFieldValue]) {
          groupByFields[groupFieldValue] = {};
        }

        if (!groupByFields[groupFieldValue][field]) {
          groupByFields[groupFieldValue][field] = 0;
        }

        groupByFields[groupFieldValue][field] += item[field];
      }
    }
  }

  for (const [key, data] of Object.entries(groupByFields)) {
    groupedItems.push({
      [groupByField]: Number(key),
      ...data,
    });
  }

  return groupedItems;
}
