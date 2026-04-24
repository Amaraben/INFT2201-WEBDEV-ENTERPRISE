// Returns true if the user has the "admin" role.

module.exports = function isAdmin(user) {
  // TODO: implement
  return user && user.role === 'admin';
};