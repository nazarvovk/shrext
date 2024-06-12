import type {
  BeforeMiddlewareFn,
  AfterMiddlewareFn,
  OnErrorMiddlewareFn,
  ShrextHandler,
  Handler,
  AnyFunc,
  ContextWithArgs,
  MiddlewareEntry,
} from './types'

export const shrext = <T extends AnyFunc, TMiddlewareContext = object>(
  handler_?: Handler<T, TMiddlewareContext>,
): ShrextHandler<T, TMiddlewareContext> => {
  let handler = handler_
  let beforeMiddlewares: MiddlewareEntry<BeforeMiddlewareFn<T, TMiddlewareContext>>[] = []
  let afterMiddlewares: MiddlewareEntry<AfterMiddlewareFn<T, TMiddlewareContext>>[] = []
  let onErrorMiddlewares: MiddlewareEntry<OnErrorMiddlewareFn<T, TMiddlewareContext>>[] = []

  const shrextHandler: ShrextHandler<T, TMiddlewareContext> = async (...args: Parameters<T>) => {
    if (!handler) throw new Error('Handler is not defined.')
    const middlewareContext = {
      args,
    } as ContextWithArgs<T, TMiddlewareContext>

    try {
      for (const beforeMiddleware of beforeMiddlewares) {
        const result = await beforeMiddleware.fn(middlewareContext)
        if (result) return result
      }
      let result = await handler(middlewareContext)
      for (const afterMiddleware of afterMiddlewares) {
        result = await afterMiddleware.fn(result, middlewareContext)
      }
      return result
    } catch (error) {
      let additionalErrors: unknown[] = [] // errors thrown by onError middlewares
      for (const onErrorMiddleware of onErrorMiddlewares) {
        try {
          const result = await onErrorMiddleware.fn(error, middlewareContext, additionalErrors)
          if (result) return result
        } catch (error) {
          additionalErrors = [...additionalErrors, error]
        }
      }
      throw error
    }
  }
  shrextHandler.use = (middleware, options) => {
    const { before, after, onError } = middleware
    if (before) shrextHandler.before(before, options)
    if (after) shrextHandler.after(after, options)
    if (onError) shrextHandler.onError(onError, options)
    return shrextHandler
  }
  shrextHandler.before = (fn, options) => {
    beforeMiddlewares.push({ fn, options })
    return shrextHandler
  }
  shrextHandler.after = (fn, options) => {
    afterMiddlewares.unshift({ fn, options })
    return shrextHandler
  }
  shrextHandler.onError = (fn, options) => {
    onErrorMiddlewares.unshift({ fn, options })
    return shrextHandler
  }
  shrextHandler.handler = (newHandler) => {
    handler = newHandler
    return shrextHandler
  }
  shrextHandler.remove = (id, options) => {
    if (!options || options.before) {
      beforeMiddlewares = beforeMiddlewares.filter((middleware) => middleware.options?.id !== id)
    }
    if (!options || options.after) {
      afterMiddlewares = afterMiddlewares.filter((middleware) => middleware.options?.id !== id)
    }
    if (!options || options.onError) {
      onErrorMiddlewares = onErrorMiddlewares.filter((middleware) => middleware.options?.id !== id)
    }
  }

  return shrextHandler
}
