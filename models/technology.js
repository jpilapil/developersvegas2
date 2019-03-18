const mongoose = require('mongoose')
const schema = mongoose.Schema

const technology_schema = new schema({
   // row_id is for migration to SQL
   row_id: {
      type: Number, // auto-incremented ID
      required: true,
   },
   name: {
      type: String,
      required: true,
   },
   popularity: {
      type: Number,
      default: 10,
   },
})

module.exports = technology = mongoose.model('technologies', technology_schema)
