const Comment = new Schema({
  post_id: { type: Schema.Types.ObjectId, ref: 'Post' },
  author_id: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: Date
});

module.exports=Comment