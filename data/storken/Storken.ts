/* eslint-disable */
import { createHooks, IHooks } from './useStorken'
import { Dispatch } from 'react'

export interface IStorken<T> {
  id: number | string
  key: string
  namespace: string
  address: string
  config: StorkenConfig<T>
  args?: unknown[]
  value: T
  gotOnce: boolean
  loading: boolean | null
  listeners: Dispatch<string>[]
  plugins: {
    [key: string]: ReturnType<StorkenPluginDefinition>
  }
  eventListeners: Record<string, Array<EventFunc>>
  getter?: TGetter<T>
  setter?: TSetter<T>
  _: boolean

  on(name: string, func: EventFunc): void
  dispatchEvent(name: keyof IEvents, ...args: unknown[]): Promise<void>
  loadPlugins(): {
    [key: string]: ReturnType<StorkenPluginDefinition>
  }
  set(
    val: T | ((value: T) => Promise<T>),
    opts?:
      | {
          force?: boolean
          disableSetter?: boolean
          overrideSetter?: TSetter<T>
        }
      | {},
  ): Promise<T>
  setByGetter(...args: unknown[]): Promise<T | undefined>
  listen(listener: Dispatch<string>, args?: unknown[]): () => void
  updateListeners(val: any): void
  load(loading: boolean | null): void
  reset(): Promise<void> | undefined
}

export interface IPlugins {
  [key: string]: StorkenPluginDefinition
}

export interface IEvents {
  effect: string
  load: string
  unmount: string
  beforeSet: string
  beforeSetter: string
  afterSetter: string
  afterSet: string
  set: string
  getting: string
  got: string
  delete: string
  clear: string
  reset: string
  resetAll: string
}

export type StorkenType<TStorken> = TStorken extends Storken<infer T>
  ? T
  : unknown

export type StorkenPluginDefinition = <T>(storken: IStorken<T>) => void | any

export type TSetter<T> = <TReturn>(
  val: T,
  ...args: unknown[]
) => T | TReturn | TReturn extends Promise<infer R> ? Promise<R> | R : TReturn

export type TGetter<T> =
  | ((...args: any[]) => <T>(storken: Storken<T>) => T | Promise<T>)
  | ((...args: any[]) => T | Promise<T>)

export interface StorkenConfig<T> {
  key: string
  namespace?: string
  initialValue?: T
  plugins?: IPlugins extends infer P ? P : IPlugins
  getOnce?: boolean
  loading?: boolean
  getter?: TGetter<T>
  setter?: TSetter<T>
  args?: unknown extends infer U ? U[] : unknown[]
  disableAutoGetter?: boolean
  disableSetterOnGetter?: boolean
  disableGetterOnLoading?: boolean
  getOnlyOnMount?: boolean
  setWithSetter?: boolean
}

type EventFunc = (...args: unknown[]) => void | PromiseLike<unknown>

export class Storken<T> implements IStorken<T> {
  id: number | string
  key: string
  namespace: string
  address: string
  config: StorkenConfig<T>
  args?: unknown[]
  value: T
  gotOnce: boolean
  loading: boolean | null
  listeners: Dispatch<string>[]
  plugins: {
    [key: string]: ReturnType<StorkenPluginDefinition>
  } = {}
  eventListeners: Record<string, Array<EventFunc>>
  _: boolean
  getter?: TGetter<T>
  setter?: TSetter<T>

  constructor(config: StorkenConfig<T>) {
    this.id = Date.now()
    this.key = config.key
    this.config = config
    this.namespace = config.namespace || 'storken::'
    this.address = this.namespace + this.key
    this.args = [...(config.args || [])]
    this.value = (
      Object.keys(config).includes('initialValue') ? config.initialValue : {}
    ) as T
    this.listeners = []
    this.eventListeners = {}
    this.loading = config?.loading || false
    this.gotOnce = false
    this._ = false
    this.getter = this.config.getter
    this.setter = this.config.setter

    const { plugins } = config

    if (plugins instanceof Object) {
      this.plugins = Object.keys(plugins).reduce(
        (obj, key) => {
          if (!obj) {
            obj = {}
          }

          const plugin: ReturnType<StorkenPluginDefinition> = plugins[key](this)
          obj[key] = plugin

          return obj
        },
        {} as {
          [key: string]: ReturnType<StorkenPluginDefinition>
        },
      )
    }
  }

  on = (name: string, func: EventFunc): void => {
    if (this?.eventListeners?.[name]) {
      this.eventListeners[name].push(func)
    } else {
      this.eventListeners[name] = [func]
    }
  }

  dispatchEvent = async (
    name: keyof IEvents,
    ...args: unknown[]
  ): Promise<void> => {
    if (!this.eventListeners?.[name]) {
      return undefined
    }
    for (const func of this.eventListeners[name]) {
      await func(...args)
    }
  }

  loadPlugins = (): {
    [key: string]: ReturnType<StorkenPluginDefinition>
  } => {
    const { plugins } = this
    if (!plugins) {
      return {}
    }

    return Object.keys(plugins).reduce(
      (obj, key): { [key: string]: ReturnType<StorkenPluginDefinition> } => {
        // if (!(key.charAt(0) === key.charAt(0).toUpperCase())) {
        //   throw new Error(`Plugin ${key} must be capitalized`)
        // }

        let cb = plugins[key]
        cb = typeof cb === 'function' ? (cb as Function)(this) : cb
        obj[key] = cb

        return obj
      },
      {} as { [key: string]: ReturnType<StorkenPluginDefinition> },
    )
  }

  set = async (
    val: T | ((value: T) => Promise<T>),
    opts: {
      force?: boolean
      disableSetter?: boolean
      overrideSetter?: TSetter<T>
    } = {},
  ): Promise<T> => {
    val = val instanceof Function ? await val(this.value as T) : val
    const eventArgs = { val, loading: this.loading, args: this.args }
    this.dispatchEvent('beforeSet', eventArgs)

    if (this.value === val && !opts?.force) {
      return this.value as T
    }

    const setter: TSetter<T> | undefined = opts.overrideSetter || this.setter
    const stork = this
    const setValue = async (value: T): Promise<T> => {
      this.value = value
      this.dispatchEvent('set', eventArgs)
      this.updateListeners(value)
      this.dispatchEvent('afterSet', eventArgs)
      return value as T
    }

    if (typeof setter === 'function' && !opts.disableSetter) {
      this.load(null)
      this.dispatchEvent('beforeSetter', eventArgs)

      if (setter) {
        return Promise.resolve(
          setter.call(this, val, ...(this.args || [])),
        ).then(async (setterResponse: unknown): Promise<T> => {
          stork.load(false)
          stork.dispatchEvent('afterSetter', eventArgs)
          if (stork.config.setWithSetter) {
            return setValue(setterResponse as T)
          } else {
            return setValue(val as T)
          }
        })
      } else {
        return setValue(val as T)
      }
    } else {
      return setValue(val)
    }
  }

  setByGetter = async (...args: unknown[]): Promise<T | undefined> => {
    console.log('setByGetter', { args })
    const { getter } = this
    if (!getter) {
      return
    }

    if (this.config.disableGetterOnLoading && this.loading) {
      return this.value
    }
    this.load(true)
    this.dispatchEvent('getting', ...args)

    const insiderFunction =
      typeof getter === 'function' ? getter(...args) : getter
    let response

    if (insiderFunction instanceof Function) {
      response = insiderFunction<T>(this)
    } else {
      response = insiderFunction
    }

    return Promise.resolve(response).then((realResponse) => {
      this.load(false)
      this.dispatchEvent('got', realResponse, ...args)

      if (realResponse) {
        return this.set(realResponse as T, {
          force: true,
          disableSetter: this.config.disableSetterOnGetter || true,
        })
          .then(() => {
            this.load(false)
          })
          .then(() => realResponse)
      }
    })
  }

  listen = (listener: Dispatch<string>, args?: unknown[]): (() => void) => {
    this.args = args

    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener)
    }

    if (
      (!this.config?.disableAutoGetter && !this.gotOnce) ||
      !this.config?.getOnlyOnMount
    ) {
      console.log({ args })
      this.setByGetter(...(args as unknown[]))
    }

    this.dispatchEvent('effect', {
      val: this.value,
      loading: this.loading,
      args,
    })

    return (): void => {
      delete this.listeners?.[this.listeners.indexOf(listener)]
      this.listeners = this.listeners.filter(Boolean)

      if (this.config.getOnce && !this.gotOnce) {
        this.gotOnce = true
      }

      this.dispatchEvent('unmount', {
        val: this.value,
        loading: this.loading,
        args,
      })
    }
  }

  updateListeners = (value?: any): void => {
    const nextVal = !this._
    this._ = nextVal

    for (const listener of this.listeners) {
      if (listener) {
        listener(String(String(Date.now()) + nextVal))
      }
    }
  }

  load = (loading: boolean | null): void => {
    this.loading = loading
    this.updateListeners(loading)
    this.dispatchEvent('load')
  }

  reset = (): Promise<void> | undefined => {
    if (!this.config?.initialValue) {
      return
    }
    return this.set(this.config.initialValue, { force: true }).then(
      (): void => {
        this.dispatchEvent('reset')
      },
    )
  }
}

export interface IBundle {
  [key: string]: Storken<any extends infer U ? U : any>
}

export interface StorkenCollectiveConfig<Bundle> {
  plugins?: IPlugins
  getters?: Record<keyof Bundle, TGetter<StorkenType<Bundle[keyof Bundle]>>>
  setters?: Record<keyof Bundle, TSetter<StorkenType<Bundle[keyof Bundle]>>>
  options?: Partial<StorkenConfig<StorkenType<Bundle[keyof Bundle]>>>
  storkenOptions?: {
    [key in keyof Bundle]: Partial<
      StorkenConfig<StorkenType<Bundle[keyof Bundle]>>
    >
  }
  initialValues?: Record<keyof Bundle, StorkenType<Bundle[keyof Bundle]>>
}

export const createStorken =
  (bundles: IBundle, config: StorkenCollectiveConfig<IBundle>) =>
  <T>(key: string, ...args: unknown[]): Storken<T> => {
    const initialValue =
      config?.initialValues && Object.keys(config?.initialValues).includes(key)
        ? config?.initialValues[key]
        : config.options?.initialValue

    bundles[key] = new Storken<T | typeof initialValue>({
      key,
      args,
      plugins: config?.plugins,
      getter: config?.getters?.[key],
      setter: config?.setters?.[key],
      ...(config?.options || {}),
      initialValue,
      ...(config?.storkenOptions?.[key] || {}),
    })

    return bundles[key] as Storken<T>
  }

export const createStore = (
  config: StorkenCollectiveConfig<IBundle>,
): [IBundle, IHooks] => {
  const Bundles: IBundle = {}
  const Config: StorkenCollectiveConfig<typeof Bundles> = config

  const hooks = createHooks(Bundles, Config)
  return [
    new Proxy(Bundles, {
      get: (target, key: string) => {
        if (key in target) {
          return target[key]
        } else {
          const stork = createStorken(target, Config)<any>(key as string)
          return stork
        }
      },
      set: (target, key: string, value: any) => {
        if (key in target) {
          target[key].set(value)
        } else {
          const stork = createStorken(
            target,
            Config,
          )<typeof value>(key as string)
          stork.set(value)
        }
        return value
      },
    }),
    hooks,
  ]
}

export default createStore
