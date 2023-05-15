export type AnyFunc = (...args: any[]) => any

export type ContextWithArgs<T extends AnyFunc, TMiddlewareContext = object> = TMiddlewareContext & {
  args: Parameters<T>
}

export type Handler<T extends AnyFunc, TMiddlewareContext = object> = (
  context: ContextWithArgs<T, TMiddlewareContext>,
) => ReturnType<T>

export type BeforeMiddleware<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  context: ContextWithArgs<T, TMiddlewareContext>,
) => void | Promise<void | Awaited<ReturnType<T>>>

export type AfterMiddleware<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  prevResult: Awaited<ReturnType<T>>,
  context: ContextWithArgs<T, TMiddlewareContext>,
) => ReturnType<T> | Promise<ReturnType<T>>

export type OnErrorMiddleware<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  error: unknown,
  context: ContextWithArgs<T, TMiddlewareContext>,
) => void | Awaited<ReturnType<T>> | Promise<void | Awaited<ReturnType<T>>>

export type MiddlewareObject<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = {
  before?: BeforeMiddleware<T, TMiddlewareContext>
  after?: AfterMiddleware<T, TMiddlewareContext>
  onError?: OnErrorMiddleware<T, TMiddlewareContext>
}

export type ShrextHandler<TFunction extends AnyFunc, TMiddlewareContext = object> = {
  (...args: Parameters<TFunction>): ReturnType<TFunction> | Promise<ReturnType<TFunction>>
  use: (
    middlewareObject: MiddlewareObject<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  before: (
    beforeMiddleware: BeforeMiddleware<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  after: (
    afterMiddleware: AfterMiddleware<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  onError: (
    onErrorMiddleware: OnErrorMiddleware<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  handler: (
    handler: Handler<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
}
