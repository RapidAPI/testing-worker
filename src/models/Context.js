class Context {
  constructor(data = {}) {
    this.data = data;
  }

  get(path) {
    let object = this.data;
    return path.split(".").reduce(function (prev, curr) {
      if (prev) if (prev[curr] !== undefined) return prev[curr];
      throw `Name ${path} does not exist in context ${JSON.stringify(object, null, 4)}`;
    }, object);
  }

  set(key, value) {
    this.data[key] = value;
  }
}

module.exports = Context;
