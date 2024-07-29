/**
 *
 * @param {*} state the current collection
 * @param {*} objects objects to add to the collection
 * @param {*} additionalIndexes optional array of objects {name:string, keys: array}
 */
export function normalize(state, objects, additionalIndexes) {
  const newState = { ...state };

  additionalIndexes?.forEach((additionalIndex) => {
    if (!newState.idsBy) {
      newState.idsBy = {};
    }
    if (!newState.idsBy[additionalIndex.name]) {
      newState.idsBy[additionalIndex.name] = {};
    }
  });

  if (typeof objects[Symbol.iterator] !== "function") {
    throw Error("normalize require iterable objects");
  }

  objects?.forEach((object) => {
    if (!newState.byID) {
      throw Error("normalize require byID={} and allIDs=[] in initialState ");
    }
    const previous = newState.byID[object.id]
      ? { ...newState.byID[object.id] }
      : null;
    // overwrite object
    newState.byID[object.id] = object;

    if (!newState.allIDs.includes(object.id)) {
      newState.allIDs.push(object.id);
    }

    additionalIndexes?.forEach((additionalIndex) => {
      // Prepare collection
      let curr = newState.idsBy[additionalIndex.name];
      additionalIndex.keys.forEach((idxKey, idx) => {
        if (!curr[object[idxKey]]) {
          curr[object[idxKey]] =
            additionalIndex.keys.length - 1 === idx ? [object.id] : {};
        } else {
          if (additionalIndex.keys.length - 1 === idx) {
            if (!curr[object[idxKey]].includes(object.id)) {
              curr[object[idxKey]].push(object.id);
            }
          }
        }
        curr = curr[object[idxKey]];
      });

      if (previous) {
        if (unmatchingKeys(object, previous, additionalIndex.keys)) {
          // Remove object id from array using previous keys

          let prevPath = newState.idsBy[additionalIndex.name];
          additionalIndex.keys.forEach((idxKey) => {
            prevPath = prevPath[previous[idxKey]];
          });

          const index = prevPath.indexOf(object.id);
          prevPath.splice(index, 1);
        }
      }
    });

    if (
      object.type === "ROOT" ||
      object.name === "ROOT" ||
      object.code === "ROOT"
    ) {
      newState.rootID = object.id;
    }
  });
  return newState;
}

export function add_index(name, builder, state) {
  if (!state.idBy) {
    state.idBy = {};
  }
  if (!state.idBy[name]) {
    state.idBy[name] = {};
  }
  state.allIDs.forEach((id) => {
    const [key, value] = builder(state.byID[id]);
    state.idBy[name][key] = value;
  });
  return state;
}

/**
 *
 * @param {*} state current state
 * @param {*} joins payload to add to state
 * @param {*} config with fields, objects and keys. Fields are the name of , objects are the type of objects, and keys are the the object ids in the payload
 */
export function normjoin(state, joins, config) {
  const newState = { ...state };
  const object1 = config.keys[0]; // activityID
  const object2 = config.keys[1]; // equipmentID

  const nameObj1 = config.objects[0].name;
  const nameObj2 = config.objects[1].name;

  // create missing objects if required
  joins.forEach((item) => {
    const id1 = item[config.fields[0]];
    const id2 = item[config.fields[1]];

    if (!newState[nameObj2].idsBy || !newState[nameObj2].idsBy[object1]) {
      throw new Error(
        `Initial state should have {${nameObj2}:{idsBy:{${object1}:{}}}}`
      );
    }

    if (!newState[nameObj1].idsBy || !newState[nameObj1].idsBy[object2]) {
      throw new Error(
        `Initial state should have {${nameObj1}:{idsBy:{${object2}:{}}}}`
      );
    }

    if (!newState[nameObj2].idsBy[object1][id1]) {
      newState[nameObj2].idsBy[object1][id1] = [];
    }

    if (!newState[nameObj1].idsBy[object2][id2]) {
      newState[nameObj1].idsBy[object2][id2] = [];
    }

    if (item.deleted) {
      newState[nameObj2].idsBy[object1][id1] = newState[nameObj2].idsBy[
        object1
      ][id1].filter((id) => id !== id2);
      newState[nameObj1].idsBy[object2][id2] = newState[nameObj1].idsBy[
        object2
      ][id2].filter((id) => id !== id1);
      return;
    }

    if (!newState[nameObj2].idsBy[object1][id1].includes(id2)) {
      newState[nameObj2].idsBy[object1][id1].push(id2);
    }

    if (!newState[nameObj1].idsBy[object2][id2].includes(id1)) {
      newState[nameObj1].idsBy[object2][id2].push(id1);
    }
  });

  return newState;
}

export function handleError(state, error, module = "app") {
  
  let message = error;
  if (error instanceof Error) {
    message = error.stack || error.message;
    // Log error anyway
    console.error(error);
  } else if (error instanceof Object) {
    message = error.e?.message || error.message;
    // Log error anyway
    console.log(error);
  } else {
    message = error;
    console.log(error);
  }

  return [...state, { id: `${module}:${state.length}`, error: message }];
}

/**
 *
 * @param {*} object new object
 * @param {*} previous previous object
 * @param {*} arrayOfKeys array of keys
 */
function unmatchingKeys(object, previous, arrayOfKeys) {
  for (const keyName of arrayOfKeys) {
    const key1 = object[keyName];
    const key2 = previous[keyName];

    if (key1 !== key2) {
      return true;
    }
  }
  return false;
}
