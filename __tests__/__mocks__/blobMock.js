class Blob {
  constructor(data, options) {
    this.data = data;
    this.options = options;
  }

  arrayBuffer() {
    return Promise.resolve(new Uint8Array(this.data).buffer);
  }

  text() {
    return Promise.resolve(new TextDecoder().decode(new Uint8Array(this.data)));
  }

  slice(start, end, contentType) {
    return new Blob(this.data.slice(start, end), {type: contentType});
  }

  get size() {
    return this.data.length;
  }

  get type() {
    return this.options.type;
  }
}

global.Blob = Blob;
