class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();
  private factories: Map<string, (...args: any[]) => any> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(container: string | (new (...args: any[]) => T), instance: T): void {
    const serviceKey = typeof container === 'string' ? container : container.name;
    this.services.set(serviceKey, instance);
  }

  registerFactory<T>(container: string | (new (...args: any[]) => T), factory: (...args: any[]) => T): void {
    const serviceKey = typeof container === 'string' ? container : container.name;
    this.factories.set(serviceKey, factory);
  }

  get<T>(container: string | (new (...args: any[]) => T), ...args: any[]): T {
    const serviceKey = typeof container === 'string' ? container : container.name;
    if (this.services.has(serviceKey)) {
      return this.services.get(serviceKey);
    }
    if (this.factories.has(serviceKey)) {
      const factory = this.factories.get(serviceKey)!;
      const instance = factory(...args);
      this.services.set(serviceKey, instance);
      return instance;
    }
    throw new Error(`Service '${serviceKey}' not found in container`);
  }

  has(container: string | (new (...args: any[]) => any)): boolean {
    const serviceKey = typeof container === 'string' ? container : container.name;
    return this.services.has(serviceKey) || this.factories.has(serviceKey);
  }

  remove(container: string | (new (...args: any[]) => any)): void {
    const serviceKey = typeof container === 'string' ? container : container.name;
    this.services.delete(serviceKey);
    this.factories.delete(serviceKey);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export default Container;