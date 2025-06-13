const mongoose = require('mongoose')
const { Schema } = mongoose

const Post = new Schema({
  author_id: { 
    required:true,
    type: Schema.Types.ObjectId, ref: 'User' 
},
  caption: {
    type: String,
  },
  content_urls: {
     type: String,
    required: [true, "Post URL required"]
  },
  created_at: {
    type: Date,
    required: true
  },
  visibility: {
    type:String,
    enum:['visible','archived']
  }
})

module.exports = Post