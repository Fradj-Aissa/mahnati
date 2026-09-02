/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")
  const courses = app.findCollectionByNameOrId("courses")

  const collection = new Collection({
    name: "enrollments",
    type: "base",
    listRule: "user.id = @request.auth.id",
    viewRule: "user.id = @request.auth.id",
    createRule: "@request.auth.id != \"\" && user.id = @request.auth.id",
    updateRule: "user.id = @request.auth.id",
    deleteRule: "user.id = @request.auth.id",
    fields: [
      {
        id: "relation_user", type: "relation", name: "user", system: false, hidden: false,
        presentable: false, collectionId: users.id, cascadeDelete: false, minSelect: 1, maxSelect: 1, required: true,
      },
      {
        id: "relation_course", type: "relation", name: "course", system: false, hidden: false,
        presentable: false, collectionId: courses.id, cascadeDelete: false, minSelect: 1, maxSelect: 1, required: true,
      },
      {
        id: "number_progress", type: "number", name: "progress", system: false, hidden: false,
        presentable: false, min: 0, max: 100, onlyInt: true, required: false,
      },
      {
        id: "select_status", type: "select", name: "status", system: false, hidden: false,
        presentable: false, values: ["in_progress", "completed", "saved"], maxSelect: 1, required: true,
      },
      { id: "autodate_created", type: "autodate", name: "created", hidden: false, onCreate: true, onUpdate: false },
      { id: "autodate_updated", type: "autodate", name: "updated", hidden: false, onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_enrollments_user_course ON enrollments (user, course)",
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("enrollments")
  return app.delete(collection)
})
