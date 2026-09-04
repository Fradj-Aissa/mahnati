/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")

  const comments = new Collection({
    name: "comments", type: "base", listRule: "", viewRule: "", createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { id: "comment_user", name: "user", type: "relation", collectionId: users.id, minSelect: 1, maxSelect: 1, required: true, cascadeDelete: true },
      { id: "comment_target_type", name: "target_type", type: "select", values: ["course", "artisan"], maxSelect: 1, required: true },
      { id: "comment_target_id", name: "target_id", type: "text", required: true, max: 15 },
      { id: "comment_content", name: "content", type: "text", required: true, max: 1000 },
      { id: "comment_rating", name: "rating", type: "number", required: true, min: 1, max: 5, onlyInt: true },
      { id: "comment_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { id: "comment_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(comments)

  const reports = new Collection({
    name: "reports", type: "base", listRule: "@request.auth.role = \"admin\"", viewRule: "@request.auth.role = \"admin\"", createRule: null, updateRule: null, deleteRule: "@request.auth.role = \"admin\"",
    fields: [
      { id: "report_comment", name: "comment", type: "relation", collectionId: comments.id, minSelect: 1, maxSelect: 1, required: true, cascadeDelete: true },
      { id: "report_user", name: "user", type: "relation", collectionId: users.id, minSelect: 1, maxSelect: 1, required: true, cascadeDelete: true },
      { id: "report_reason", name: "reason", type: "select", values: ["inappropriate", "spam", "hate", "other"], maxSelect: 1, required: true },
      { id: "report_details", name: "details", type: "text", max: 500, required: false },
      { id: "report_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_reports_user_comment ON reports (user, comment)"],
  })
  return app.save(reports)
}, (app) => {
  const reports = app.findCollectionByNameOrId("reports")
  app.delete(reports)
  const comments = app.findCollectionByNameOrId("comments")
  return app.delete(comments)
})
