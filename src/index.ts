import type {
  BeforeMiddleware,
  AfterMiddleware,
  OnErrorMiddleware,
  ContextOf,
  ShrextHandler,
  FunctionWithContext,
} from './types'

export * from './types'

export const shrext = <T extends FunctionWithContext, TMiddlewareContext = object>(
  handler: (ctx: ContextOf<T>, ShrextContext: TMiddlewareContext) => ReturnType<T>,
): ShrextHandler<T, TMiddlewareContext> => {
  const beforeMiddlewares: BeforeMiddleware<T, TMiddlewareContext>[] = []
  const afterMiddlewares: AfterMiddleware<T, TMiddlewareContext>[] = []
  const onErrorMiddlewares: OnErrorMiddleware<T, TMiddlewareContext>[] = []

  const shrextHandler: ShrextHandler<T, TMiddlewareContext> = async (nextCtx: ContextOf<T>) => {
    const middlewareContext = {} as TMiddlewareContext
    try {
      for (const beforeMiddleware of beforeMiddlewares) {
        const result = await beforeMiddleware(nextCtx, middlewareContext)
        if (result) return result
      }
      let result = await handler(nextCtx, middlewareContext)
      for (const afterMiddleware of afterMiddlewares) {
        result = await afterMiddleware(result, middlewareContext, nextCtx)
      }
      return result
    } catch(error){
      for (const onErrorMiddleware of onErrorMiddlewares) {
        const result = await onErrorMiddleware(error, nextCtx, middlewareContext)
        if (result) return result
      }
      throw error
    }
  }
  shrextHandler.use = (middleware) => {
    const { before, after } = middleware
    if (before) shrextHandler.before(before)
    if (after) shrextHandler.after(after)
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
    onErrorMiddlewares.push(onErrorMiddleware)
    return shrextHandler
  }
  return shrextHandler
}
