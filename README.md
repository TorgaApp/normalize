# Normalize 

[![Build Status](https://drone.torga.fr/api/badges/TorgaApp/normalize/status.svg)](https://drone.torga.fr/TorgaApp/normalize)

A lightweight library for normalizing state collections and managing relationships between objects. This module provides functions to normalize collections, add indexes, and handle complex joins efficiently.


## Installation 

You can install this module via npm:
```bash
npm install torga-normalize
```

## Usage

### normalize

Normalizes a collection of objects and updates indexes.

Parameters: 

- `state` (Object): The current state.
- `objects` (Iterable): The objects to add to the collection.
- `additionalIndexes` (Array): Optional array of objects `{name: string, keys: array}`

Example

```javascript
import { normalize } from 'torga-normalize';

const initialState = {
  byID: {},
  allIDs: [],
};

const objects = [
  { id: 1, name: 'Task 1' },
  { id: 2, name: 'Task 2' },
];

const newState = normalize(initialState, objects);
console.log(newState);
```

### add_index

Adds an index to the state.

Parameters

- `name` (String): The name of the index.
- `builder` (Function): A function that returns `[key, value]` based on the object.
- `state` (Object): The current state.

Example

```javascript
import { add_index } from 'torga-normalize';

const state = {
  byID: { 1: { id: 1, name: 'Task 1' }, 2: { id: 2, name: 'Task 2' } },
  allIDs: [1, 2],
};

const indexedState = add_index('nameIndex', (obj) => [obj.name, obj.id], state);
console.log(indexedState);
```

### normjoin

Adds relationships between objects in the state.

Parameters

- `state` (Object): The current state.
- `joins` (Array): The payload to add to the state.
- `config` (Object): Configuration with `fields`, `objects`, and `keys`.

Example
```javascript

import { normjoin } from 'torga-normalize';

const state = {
  goals: { idsBy: { taskID: {} } },
  tasks: { idsBy: { goalID: {} } },
};

const joins = [
  { goal_id: 1, task_id: 2 },
  { goal_id: 1, task_id: 3 },
];

const config = {
  fields: ['goal_id', 'task_id'],
  objects: [{ name: 'goals' }, { name: 'tasks' }],
  keys: ['goalID', 'taskID'],
};

const newState = normjoin(state, joins, config);
console.log(newState);
```

## Reducer Example

```javascript

import { normalize, normjoin } from 'torga-normalize';

function reducer(state, action) {

    const payload = action.payload;
    switch (action.type) {
      case 'GOAL_FETCH_ALL_COMPLETE':
      case 'GOAL_CREATE_COMPLETE':
      case 'GOAL_UPDATE_COMPLETE':
        return { ...state, goals: normalize(state.goals, action.payload) };

      case 'TASK_FETCH_ALL_COMPLETE':
      case 'TASK_CREATE_COMPLETE':
      case 'TASK_UPDATE_COMPLETE':
        return { ...state, tasks: normalize(state.tasks, action.payload) };

      case 'GOALTASK_FETCH_ALL_COMPLETE':
      case 'GOALTASK_CREATE_COMPLETE':
      case 'GOALTASK_UPDATE_COMPLETE':
        return normjoin(state, action.payload, {
          fields: ['goal_id', 'task_id'],
          objects: [{ name: 'goals' }, { name: 'tasks' }],
          keys: ['goalID', 'taskID'],
        });

      // other cases...

      default:
        return state;
    }

}
```


### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.

### License

This project is licensed under the ISC License.