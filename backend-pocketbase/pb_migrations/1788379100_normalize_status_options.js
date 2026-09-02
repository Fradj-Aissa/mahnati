/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const options = {
    courses: { status: ["draft", "published"] },
    artisans: { status: ["pending", "approved", "rejected"] },
    sessions: { status: ["upcoming", "completed", "cancelled"] },
  }

  Object.entries(options).forEach(([collectionName, fields]) => {
    const collection = app.findCollectionByNameOrId(collectionName)
    Object.entries(fields).forEach(([fieldName, values]) => {
      const field = collection.fields.getByName(fieldName)
      if (field) field.values = values
    })
    app.save(collection)
  })
}, (app) => {
  return app
})