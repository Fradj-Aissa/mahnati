/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses")
  const field = collection.fields.getByName("thumbnail_url")
  if (field) field.max = 0
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses")
  const field = collection.fields.getByName("thumbnail_url")
  if (field) field.max = 2000
  return app.save(collection)
})