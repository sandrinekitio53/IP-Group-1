// Removes any key that starts with "$" or contains "." (the characters MongoDB treats as commands)
function clean(value) {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];          // drop the dangerous key
      } else {
        clean(value[key]);          // also check nested objects and arrays
      }
    }
  }
}

exports.sanitizeBody = (req, res, next) => {
  clean(req.body);                  // only the body, where signup data arrives
  next();                           // continue to the next middleware
};