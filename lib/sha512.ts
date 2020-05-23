import WASMInterface, { ITypedArray, IWASMInterface } from './WASMInterface';
import Mutex from './mutex';
import wasmJson from '../wasm/sha512.wasm.json';
import lockedCreate from './lockedCreate';

const mutex = new Mutex();
let wasmCache: IWASMInterface = null;

export function sha512(data: string | Buffer | ITypedArray): Promise<string> {
  if (wasmCache === null) {
    return lockedCreate(mutex, wasmJson, 64)
      .then((wasm) => {
        wasmCache = wasm;
        wasmCache.init(512);
        wasmCache.update(data);
        return wasmCache.digest();
      });
  }

  try {
    wasmCache.init(512);
    wasmCache.update(data);
    return Promise.resolve(wasmCache.digest());
  } catch (err) {
    return Promise.reject(err);
  }
}

export function createSHA512() {
  return WASMInterface(wasmJson, 64).then((wasm) => {
    wasm.init(512);
    return {
      init: () => wasm.init(512),
      update: wasm.update,
      digest: () => wasm.digest(),
    };
  });
}

export default sha512;
