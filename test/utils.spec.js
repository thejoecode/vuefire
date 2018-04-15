import {
  createSnapshot,
  extractRefs
} from '../src/utils'
import {
  Key,
  db,
  _id,
  DocumentReference,
  DocumentSnapshot
} from './helpers'

let id, doc, snapshot, collection, docRef
beforeEach(() => {
  collection = db.collection()
  docRef = new DocumentReference({
    collection,
    id: new Key(),
    data: {},
    index: 0
  })
  id = _id
  doc = new DocumentSnapshot(null, new Key(), {
    n: 42,
    is: true,
    items: [{ text: 'foo' }],
    ref: docRef
  })
  snapshot = createSnapshot(doc)
})

test('createSnapshot adds an id', () => {
  expect(snapshot.id).toBe('' + id)
})

test('id is not enumerable', () => {
  expect(Object.keys(snapshot).includes('id')).toBe(false)
})

test('contains all the data', () => {
  expect(snapshot).toEqual({
    n: 42,
    is: true,
    items: [{ text: 'foo' }],
    ref: docRef
  })
})

test('extract refs from document', () => {
  const [noRefsDoc, refs] = extractRefs(doc.data())
  expect(noRefsDoc.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    ref: docRef
  })
})

test('leave Date objects alone when extracting refs', () => {
  const d = new Date()
  const [doc, refs] = extractRefs({
    foo: 1,
    bar: d
  })
  expect(doc.foo).toEqual(1)
  expect(doc.bar).toEqual(d)
  expect(refs).toEqual({})
})

test('extract object nested refs from document', () => {
  const [noRefsDoc, refs] = extractRefs({
    obj: {
      ref: docRef
    }
  })
  expect(noRefsDoc.obj.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    'obj.ref': docRef
  })
})

test('extract deep object nested refs from document', () => {
  const [noRefsDoc, refs] = extractRefs({
    obj: {
      nested: {
        ref: docRef
      }
    }
  })
  expect(noRefsDoc.obj.nested.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    'obj.nested.ref': docRef
  })
})

test('extracts refs from array', async () => {
  const docRef2 = new DocumentReference({
    collection,
    id: new Key(),
    data: {},
    index: 0
  })
  const [noRefsDoc, refs] = extractRefs({
    arr: [
      docRef,
      docRef2,
      docRef
    ]
  })
  expect(noRefsDoc.arr[0]).toEqual(docRef.path)
  expect(noRefsDoc.arr[1]).toEqual(docRef2.path)
  expect(noRefsDoc.arr[2]).toEqual(docRef.path)
  expect(refs).toEqual({
    'arr.0': docRef,
    'arr.1': docRef2,
    'arr.2': docRef
  })
})