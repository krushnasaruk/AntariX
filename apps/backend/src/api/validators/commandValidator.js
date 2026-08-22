export function validateCommandPayload(req, res, next) {
  const { commandType, params } = req.body;
  if (!commandType) {
    return res.status(400).json({ success: false, error: 'Missing commandType in payload' });
  }
  next();
}
