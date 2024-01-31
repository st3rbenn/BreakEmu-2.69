function GS(target: any, propertyName: string): void {
  const privatePropName = `_${propertyName}`;

  // Create getter
  Object.defineProperty(target, propertyName, {
      get: function () {
          return this[privatePropName];
      },
      enumerable: true,
      configurable: true
  });

  // Create setter
  Object.defineProperty(target, propertyName, {
      set: function (newValue) {
          this[privatePropName] = newValue;
      },
      enumerable: true,
      configurable: true
  });
}

export {
  GS
}