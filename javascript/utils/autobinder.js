export default function autoBind(obj) {
  const keys = Reflect.ownKeys(obj.constructor.prototype);
  keys.forEach((key) => {
    if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(obj);
    }
  });
  return obj;
}
