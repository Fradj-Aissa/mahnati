/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.fields.getByName("email").required = false
  collection.passwordAuth.identityFields = ["email", "username"]

  collection.fields.add(new Field({
    "help": "اسم المستخدم الظاهر في الحساب",
    "hidden": false,
    "id": "text_user_username",
    "max": 50,
    "min": 3,
    "name": "username",
    "pattern": "^[a-zA-Z0-9_.-]+$",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "text"
  }))
  collection.fields.add(new Field({
    "help": "رقم الهاتف عند اختياره كوسيلة التواصل",
    "hidden": false,
    "id": "text_user_phone",
    "max": 30,
    "min": 0,
    "name": "phone",
    "pattern": "",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))
  collection.fields.add(new Field({
    "help": "وسيلة التواصل المفضلة",
    "hidden": false,
    "id": "select_user_contact",
    "maxSelect": 1,
    "name": "contact_method",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["email", "phone"]
  }))
  collection.fields.add(new Field({
    "help": "تاريخ ميلاد المستخدم",
    "hidden": false,
    "id": "date_user_birth",
    "max": "",
    "min": "",
    "name": "date_of_birth",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))
  collection.indexes.push("CREATE UNIQUE INDEX `idx_username__pb_users_auth_` ON `users` (`username`) WHERE `username` != ''")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.fields.getByName("email").required = true
  collection.passwordAuth.identityFields = ["email"]
  collection.indexes = collection.indexes.filter((index) => !index.includes("idx_username__pb_users_auth_"))
  collection.fields.removeById("text_user_username")
  collection.fields.removeById("text_user_phone")
  collection.fields.removeById("select_user_contact")
  collection.fields.removeById("date_user_birth")
  return app.save(collection)
})
