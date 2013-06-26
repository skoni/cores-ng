var j = require('jski');

module.exports = j.object({

  boolean: j.boolean(),
  number: j.number().minimum(-1.5).maximum(1.5),
  integer: j.integer().minimum(0).maximum(10).multipleOf(2),
  string: j.string().minLength(2).maxLength(10).pattern('[a-zA-Z]+'),

  'enum': j.enum(1, 2, 3),

  ref: j.ref('Foo'),

  array: j.array(j.object({
    foo: j.boolean()
  })),

  anyof: j.array(j.anyOf(
    j.object({ foo: j.number() }).custom('name', 'foo'),
    j.object({ bar: j.string() }).custom('name', 'bar')
  )),
  
  object: j.object({
    foo: j.number(),
    bar: j.string()
  }),

  text: j.string().custom('view', 'text'),
  password: j.string().custom('view', 'password')
});