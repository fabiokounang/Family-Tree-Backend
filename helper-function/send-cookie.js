module.exports = (type, req, res, token, isLogout = false) => {
  let expire = isLogout ? new Date(Date.now() + (1)) : new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
  const cookieOptions = {
    expires: expire,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // only https
    httpOnly: true, // cookies cannot be accessed or modified from the browser 
    sameSite: 'none'
  }
  res.cookie('token' + type, token, cookieOptions);
}