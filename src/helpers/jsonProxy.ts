/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-rest-params */
export function jsonProxy<T>(json: string, update: (json: string) => void): T {


  const source = JSON.parse(json || "{}");
  return new Proxy(source, {
    // get(target, prop) {
    //   //console.log("p get", target, prop);
    //   const val = target[prop];
    //   const isArray = val && val.constructor.toString().indexOf("Array") > -1
    //   if (val != null && typeof val === 'object' && isArray) {
    //     // proxy val
    //     const proxied = createDeepProxy(val, {
    //       set(deepTarget, path, value, receiver) {
    //         //console.log('set', path.join('.'), '=', JSON.stringify(value));
    //         target[prop] = val.slice();
    //         console.log(target[prop]);

    //         const newObj = JSON.parse(json);
    //         if (newObj[prop] != target[prop]) {
    //           newObj[prop] = target[prop];
    //           update(JSON.stringify(newObj));
    //         }
    //       },

    //       deleteProperty(deepTarget, path) {
    //         console.log('delete', path.join('.'));
    //       }
    //     });
    //   }

    //   return val;
    // },
    set(obj, prop: string, value) {
      const newObj = JSON.parse(json);
      newObj[prop] = value;

      update(JSON.stringify(newObj));
      return true;
    },
    deleteProperty(obj, prop: string) {
      const newObj = JSON.parse(json);
      delete newObj[prop];
      update(JSON.stringify(newObj));
      return true;
    },
  });
}

export function createDeepProxy<T>(target: any, handler: any): T {
  const preproxy = new WeakMap();

  function makeHandler(path: string) {
    return {
      set(target: any, key: string, value: any, receiver: any) {
        if (value != null && typeof value === "object") {
          value = proxify(value, [...path, key]);
        }
        target[key] = value;

        if (handler.set) {
          handler.set(target, [...path, key], value, receiver);
        }
        return true;
      },

      deleteProperty(target: any, key: string) {
        if (Reflect.has(target, key)) {
          unproxy(target, key);
          const deleted = Reflect.deleteProperty(target, key);
          if (deleted && handler.deleteProperty) {
            handler.deleteProperty(target, [...path, key]);
          }
          return deleted;
        }
        return false;
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function unproxy(obj: any, key: string) {
    if (preproxy.has(obj[key])) {
      // console.log('unproxy',key);
      obj[key] = preproxy.get(obj[key]);
      preproxy.delete(obj[key]);
    }

    for (const k of Object.keys(obj[key])) {
      if (obj[key][k] != null && typeof obj[key][k] === "object") {
        unproxy(obj[key], k);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function proxify(obj: any, path: any) {
    for (const key of Object.keys(obj)) {
      if (obj[key] != null && typeof obj[key] === "object") {
        obj[key] = proxify(obj[key], [...path, key]);
      }
    }
    const p = new Proxy(obj, makeHandler(path));
    preproxy.set(p, obj);
    return p;
  }

  return proxify(target, []);
}
