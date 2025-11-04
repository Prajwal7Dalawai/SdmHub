const mongoose = require('mongoose')
const { Schema } = mongoose

const PostSchema = new Schema({
  author_id: { 
    required:true,
    type: Schema.Types.ObjectId, ref: 'User' 
  },
  caption: {
    type: String,
  },
  content_url: {
     type: String,
    // required: [true, "Post URL required"]
  },
  content_public_id: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  visibility: {
    type:String,
    enum:['visible','archived']
  }
})

module.exports = mongoose.model('Post', PostSchema)