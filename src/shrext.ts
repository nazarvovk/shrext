import type {
  BeforeMiddleware,
  AfterMiddleware,
  OnErrorMiddleware,
  ShrextHandler,
  Handler,
  AnyFunc,
  ContextWithArgs,
} from './types'

export const shrext = <T extends AnyFunc, TMiddlewareContext = object>(
  handler_?: Handler<T, TMiddlewareContext>,
): ShrextHandler<T, TMiddlewareContext> => {
  let handler = handler_
  const beforeMiddlewares: BeforeMiddleware<T, TMiddlewareContext>[] = []
  const afterMiddlewares: AfterMiddleware<T, TMiddlewareContext>[] = []
  const onErrorMiddlewares: OnErrorMiddleware<T, TMiddlewareContext>[] = []

  const shrextHandler: ShrextHandler<T, TMiddlewareContext> = async (...args: Parameters<T>) => {
    if (!handler) throw new Error('Handler is not defined.')
    const middlewareContext = {
      args,
    } as ContextWithArgs<T, TMiddlewareContext>

    try {
      for (const beforeMiddleware of beforeMiddlewares) {
        const result = await beforeMiddleware(middlewareContext)
        if (result) return result
      }
      let result = await handler(middlewareContext)
      for (const afterMiddleware of afterMiddlewares) {
        result = await afterMiddleware(result, middlewareContext)
      }
      return result
    } catch (error) {
      let additionalErrors: unknown[] = [] // errors thrown by onError middlewares
      for (const onErrorMiddleware of onErrorMiddlewares) {
        try {
          const result = await onErrorMiddleware(error, middlewareContext, additionalErrors)
          if (result) return result
        } catch (error) {
          additionalErrors = [...additionalErrors, error]
        }
      }
      throw error
    }
  }
  shrextHandler.use = (middleware) => {
    const { before, after, onError } = middleware
    if (before) shrextHandler.before(before)
    if (after) shrextHandler.after(after)
    if (onError) shrextHandler.onError(onError)
    return shrextHandler
  }
  shrextHandler.before = (beforeMiddleware) => {
    beforeMiddlewares.push(beforeMiddleware)
    return shrextHandler
  }
  shrextHandler.after = (afterMiddleware) => {
    afterMiddlewares.unshift(afterMiddleware)
    return shrextHandler
  }
  shrextHandler.onError = (onErrorMiddleware) => {
    onErrorMiddlewares.unshift(onErrorMiddleware)
    return shrextHandler
  }
  shrextHandler.handler = (newHandler) => {
    handler = newHandler
    return shrextHandler
  }

  return shrextHandler
}
