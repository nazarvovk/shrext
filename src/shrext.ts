import type { Shrext, Handler, AnyFunc, ContextWithArgs, ShrextInstanceState } from './types'

const stateFromPartial = <T extends AnyFunc, TMiddlewareContext>(
  partial?: Partial<ShrextInstanceState<T, TMiddlewareContext>>,
): ShrextInstanceState<T, TMiddlewareContext> => ({
  handler: partial?.handler,
  before: [...(partial?.before ?? [])],
  after: [...(partial?.after ?? [])],
  onError: [...(partial?.onError ?? [])],
})

export const shrext = <T extends AnyFunc, TContext>(
  init?: Handler<T, TContext> | ShrextInstanceState<T, TContext>,
): Shrext<T, TContext> => {
  const state = stateFromPartial(typeof init === 'function' ? { handler: init } : init)

  const instance: Shrext<T, TContext> = async (...args: Parameters<T>) => {
    if (!state.handler) throw new Error('Handler is not defined.')
    const middlewareContext = {
      args,
    } as ContextWithArgs<T, TContext>

    try {
      for (const beforeMiddleware of state.before) {
        const result = await beforeMiddleware.fn(middlewareContext)
        if (result !== undefined) return result
      }
      let result = await state.handler(middlewareContext)
      for (const afterMiddleware of state.after) {
        result = await afterMiddleware.fn(result, middlewareContext)
      }
      return result
    } catch (error) {
      let additionalErrors: unknown[] = [] // errors thrown by onError middlewares
      for (const onErrorMiddleware of state.onError) {
        try {
          const result = await onErrorMiddleware.fn(error, middlewareContext, additionalErrors)
          if (result !== undefined) return result
        } catch (error) {
          additionalErrors = [...additionalErrors, error]
        }
      }
      throw error
    }
  }
  instance.state = state
  instance.use = (middleware, options) => {
    const { before, after, onError } = middleware
    if (before) state.before.push({ fn: before, options })
    if (after) state.after.unshift({ fn: after, options })
    if (onError) state.onError.unshift({ fn: onError, options })
    return instance
  }
  instance.before = (before, options) => instance.use({ before }, options)
  instance.after = (after, options) => instance.use({ after }, options)
  instance.onError = (onError, options) => instance.use({ onError }, options)
  instance.setHandler = (newHandler) => {
    state.handler = newHandler
    return instance
  }
  instance.remove = (id, options) => {
    if (!options || options.before) {
      state.before = state.before.filter((middleware) => middleware.options?.id !== id)
    }
    if (!options || options.after) {
      state.after = state.after.filter((middleware) => middleware.options?.id !== id)
    }
    if (!options || options.onError) {
      state.onError = state.onError.filter((middleware) => middleware.options?.id !== id)
    }
  }
  instance.clone = () => shrext(state)
  return instance
}
