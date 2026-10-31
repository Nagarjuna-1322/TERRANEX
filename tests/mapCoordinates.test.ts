import test from 'node:test';
import assert from 'node:assert/strict';
import { isLatLng, normalizePath } from '../src/utils/mapCoordinates';

test('map accepts zero and boundary coordinates, rejects missing or invalid GPS', () => {
  assert.equal(isLatLng({ lat: 0, lng: 0 }), true);
  assert.equal(isLatLng({ lat: -90, lng: 180 }), true);
  for (const value of [null, undefined, {}, { lat: '27', lng: 92 }, { lat: NaN, lng: 92 }, { lat: 91, lng: 92 }, { lat: 27, lng: Infinity }]) {
    assert.equal(isLatLng(value), false);
  }
});

test('map normalizes API tuples and Firestore coordinate objects without inventing locations', () => {
  assert.deepEqual(normalizePath([[27, 92], { lat: 28, lng: 93 }, null, ['bad', 94], { lat: 0, lng: 0 }]),
    [[27, 92], [28, 93], [0, 0]]);
  assert.deepEqual(normalizePath(null), []);
  assert.deepEqual(normalizePath({ lat: 27, lng: 92 }), []);
});
