/* eslint-disable */
import { useEffect, useRef, useState } from 'react'
import {
  Storken,
  createStorken,
  IBundle,
  StorkenCollectiveConfig,
  StorkenPluginDefinition,
} from './Storken'

interface IUseStorken<T> {
  v: T
  val: T
  loading: Storken<T>['loading']
  set: Storken<T>['set']
  reset: Storken<T>['reset']
  fetch: (
    ...args: unknown[]
  ) => Promise<T | unknown | void> | T | unknown | void
  _stork: Storken<T>
  [key: string]: any
}

export interface IHooks {
  useStorken: <T>(key: string, ...args: unknown[]) => [T, IUseStorken<T>]
  useLoading: (key: string) => boolean | null
  useFetch: (key: string, ...args: unknown[]) => void
}

export const createHooks = (
  sky: IBundle,
  config: StorkenCollectiveConfig<IBundle>,
): IHooks => {
  type TKey = keyof typeof sky & string

  function useStorken<T>(key: TKey, ...args: unknown[]): [T, IUseStorken<T>] {
    const stork = useRef<Storken<T>>(
      sky?.[key] || createStorken(sky, config)<T>(key, ...args),
    ).current
    const state = useState<string>(String(Date.now()))

    useEffect((): (() => void) => stork.listen(state[1], args), [...args])

    useEffect(() => {
      if (stork.config?.getOnlyOnMount) {
        stork.setByGetter(...args)
      }
    }, [])

    const plugins: {
      [key: string]: ReturnType<StorkenPluginDefinition>
    } = stork.loadPlugins()

    const hookObject = {
      ...plugins,
      v: stork.value,
      val: stork.value,
      set: stork.set,
      reset: stork.reset,
      loading: stork.loading,
      fetch: (...fetchArgs: unknown[]): Promise<unknown> | unknown =>
        stork.setByGetter(...fetchArgs),
      _stork: stork,
    }

    return [stork.value, hookObject]
  }

  function useLoading(key: TKey): boolean | null {
    const [, stork] = useStorken(key)
    return stork.loading
  }

  function useFetch(key: TKey, ...args: unknown[]) {
    const [, stork] = useStorken(key, ...args)
    return (...additionalArgs: unknown[]) =>
      stork.fetch.apply(stork, [...args, ...additionalArgs])
  }

  return {
    useStorken,
    useLoading,
    useFetch,
  }
}
