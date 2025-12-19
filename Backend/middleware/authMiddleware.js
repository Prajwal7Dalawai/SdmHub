export const auth = (req, res, next) => {
  if (req.session?.user?.id) {
    return next();
  }

  return res.status(401).json({
    message: 'Not authenticated'
  });
};
