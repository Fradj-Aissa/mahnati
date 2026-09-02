/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  const roleField = collection.fields.getByName("role")

  if (roleField) {
    roleField.values = ["student", "artisan", "admin"]
  }

  collection.createRule = ""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.createRule = null

  return app.save(collection)
})