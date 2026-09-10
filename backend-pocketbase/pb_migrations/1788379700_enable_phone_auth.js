/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.passwordAuth.identityFields = ["email", "phone", "username"]
  collection.indexes.push("CREATE UNIQUE INDEX `idx_phone__pb_users_auth_` ON `users` (`phone`) WHERE `phone` != ''")
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.passwordAuth.identityFields = ["email", "username"]
  collection.indexes = collection.indexes.filter((index) => !index.includes("idx_phone__pb_users_auth_"))
  return app.save(collection)
})
