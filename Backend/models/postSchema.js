const mongoose = require('mongoose')
const { Schema } = mongoose

const Post = new Schema({
  author_id: { 
    required:true,
    type: Schema.Types.ObjectId, ref: 'User' 
},
  content: String,
  image_urls: [String],
  created_at: Date,
  visibility: String
})