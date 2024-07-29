import * as normalize from './normalize';

describe('Test normalize', function () {
  it('should add objects', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
    const newState = normalize.normalize(state, objects);
    expect(newState.byID[2].catego).toEqual('AVION');
  });

  it('should handle new data', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
    const newState = normalize.normalize(state, objects);
    expect(newState.byID[2].year).toEqual(2020);
    const newData = {
      id: 2,
      year: 2021,
      month: 1,
      catego: 'AVION',
      value: 3,
    };
    const updatedState = normalize.normalize(state, [newData]);
    expect(updatedState.byID[2].year).toEqual(2021);
  });

  it('should build index', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
    const newState = normalize.normalize(state, objects, [
      {
        name: 'catego',
        keys: ['catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);
    expect(newState.byID[2].catego).toEqual('AVION');
    expect(newState.idsBy.year[2020]).toEqual([1, 2, 3]);
    expect(newState.idsBy.catego['AVION']).toEqual([2]);
  });

  it('should build multi-value index', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
    const newState = normalize.normalize(state, objects, [
      {
        name: 'tree',
        keys: ['year', 'month', 'catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);
    expect(newState.idsBy.tree[2020][11]['AVIONN']).toEqual([3]);
  });

  it('should support update', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
    const newState = normalize.normalize(state, objects, [
      {
        name: 'tree',
        keys: ['year', 'month', 'catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);
    expect(newState.idsBy.tree[2020][11]['AVIONN']).toEqual([3]);

    const updateState = normalize.normalize(newState, objects, [
      {
        name: 'tree',
        keys: ['year', 'month', 'catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);
    expect(updateState.byID[2].catego).toEqual('AVION');
    expect(updateState.idsBy.tree[2020][11]['AVIONN']).toEqual([3]);
  });

  it('should support update with modified properties', function () {
    const objects = [
      { id: 1, year: 2020, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2020, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2020, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const state = { byID: {}, allIDs: [] };
        const newState = normalize.normalize(state, objects, [
      {
        name: 'tree',
        keys: ['year', 'month', 'catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);
    expect(newState.idsBy.tree[2020][11]['AVIONN']).toEqual([3]);

    const updatedObjects = [
      { id: 1, year: 2021, month: 12, catego: 'POMME', value: 10 },
      { id: 2, year: 2021, month: 12, catego: 'AVION', value: 8 },
      { id: 3, year: 2021, month: 11, catego: 'AVIONN', value: 14 },
    ];

    const updateState = normalize.normalize(newState, updatedObjects, [
      {
        name: 'tree',
        keys: ['year', 'month', 'catego'],
      },
      {
        name: 'year',
        keys: ['year'],
      },
    ]);

    expect(updateState.byID[2].year).toEqual(2021);
    expect(updateState.idsBy.tree[2020][11]['AVIONN']).toEqual([]);
    expect(updateState.idsBy.tree[2021][11]['AVIONN']).toEqual([3]);
  });
});
