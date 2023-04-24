import type {
  AfterMiddleware,
  BeforeMiddleware,
  NextContextOf,
  ShrextHandler,
  SupportedNextFunctions,
} from './types'

export * from './types'

export const shrext = <T extends SupportedNextFunctions, TMiddlewareContext = object>(
  handler: (ctx: NextContextOf<T>, ShrextContext: TMiddlewareContext) => ReturnType<T>,
): ShrextHandler<T, TMiddlewareContext> => {
  const beforeMiddlewares: BeforeMiddleware<T, TMiddlewareContext>[] = []
  const afterMiddlewares: AfterMiddleware<T, TMiddlewareContext>[] = []
  const shrextHandler: ShrextHandler<T, TMiddlewareContext> = async (nextCtx: NextContextOf<T>) => {
    const middlewareContext = {} as TMiddlewareContext
    for (const beforeMiddleware of beforeMiddlewares) {
      const result = await beforeMiddleware(nextCtx, middlewareContext)
      if (result) return result
    }
    let result = await handler(nextCtx, middlewareContext)
    for (const afterMiddleware of afterMiddlewares) {
      result = await afterMiddleware(result, middlewareContext, nextCtx)
    }
    return result
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
  return shrextHandler
}
