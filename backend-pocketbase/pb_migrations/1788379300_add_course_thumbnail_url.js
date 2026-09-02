/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses")
  collection.fields.addAt(9, new TextField({
    id: "text_thumbnail_url",
    name: "thumbnail_url",
    type: "text",
    hidden: false,
    presentable: false,
    required: false,
    max: 2000,
  }))
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses")
  collection.fields.removeById("text_thumbnail_url")
  return app.save(collection)
})
