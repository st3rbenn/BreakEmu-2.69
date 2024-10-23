function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  let instance: T;
  return class {
    constructor(...args: any[]) {
      if (!instance) {
        instance = new constructor(...args) as T;
      }
      return instance;
    }
  } as T;
}

export default Singleton;