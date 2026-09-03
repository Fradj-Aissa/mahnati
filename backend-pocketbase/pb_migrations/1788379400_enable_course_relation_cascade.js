/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("enrollments")
  const courseField = collection.fields.getByName("course")

  if (courseField) {
    courseField.cascadeDelete = true
    app.save(collection)
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("enrollments")
  const courseField = collection.fields.getByName("course")

  if (courseField) {
    courseField.cascadeDelete = false
    app.save(collection)
  }
})
