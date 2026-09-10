/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("enrollments")
  collection.listRule = "user.id = @request.auth.id || @request.auth.role = \"admin\""
  collection.viewRule = "user.id = @request.auth.id || @request.auth.role = \"admin\""
  collection.updateRule = "user.id = @request.auth.id || @request.auth.role = \"admin\""
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("enrollments")
  collection.listRule = "user.id = @request.auth.id"
  collection.viewRule = "user.id = @request.auth.id"
  collection.updateRule = "user.id = @request.auth.id"
  return app.save(collection)
})
