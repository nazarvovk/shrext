export type AnyFunc = (...args: any[]) => any

export type ContextWithArgs<T extends AnyFunc, TMiddlewareContext = object> = TMiddlewareContext & {
  args: Parameters<T>
}

export type Handler<T extends AnyFunc, TMiddlewareContext = object> = (
  context: ContextWithArgs<T, TMiddlewareContext>,
) => ReturnType<T>

export type BeforeMiddlewareFn<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  context: ContextWithArgs<T, TMiddlewareContext>,
) => void | Promise<void | Awaited<ReturnType<T>>>

export type AfterMiddlewareFn<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  prevResult: Awaited<ReturnType<T>>,
  context: ContextWithArgs<T, TMiddlewareContext>,
) => ReturnType<T> | Promise<ReturnType<T>>

export type OnErrorMiddlewareFn<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = (
  error: unknown,
  context: ContextWithArgs<T, TMiddlewareContext>,
  additionalErrors?: unknown[],
) => void | Awaited<ReturnType<T>> | Promise<void | Awaited<ReturnType<T>>>

export type MiddlewareEntry<T> = { fn: T; options?: MiddlewareOptions }

export type MiddlewareInput<T extends AnyFunc = AnyFunc> = T | MiddlewareEntry<T>

export type MiddlewareFnObject<T extends AnyFunc = AnyFunc, TMiddlewareContext = object> = {
  before?: BeforeMiddlewareFn<T, TMiddlewareContext>
  after?: AfterMiddlewareFn<T, TMiddlewareContext>
  onError?: OnErrorMiddlewareFn<T, TMiddlewareContext>
}

export type MiddlewareOptions = {
  id: string
}

export type RemoveOptions = {
  before?: boolean
  after?: boolean
  onError?: boolean
}

export type ShrextHandler<TFunction extends AnyFunc, TMiddlewareContext = object> = {
  (...args: Parameters<TFunction>): ReturnType<TFunction> | Promise<ReturnType<TFunction>>
  use: (
    middlewareObject: MiddlewareFnObject<TFunction, TMiddlewareContext>,
    options?: MiddlewareOptions,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  before: (
    beforeMiddleware: BeforeMiddlewareFn<TFunction, TMiddlewareContext>,
    options?: MiddlewareOptions,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  after: (
    afterMiddleware: AfterMiddlewareFn<TFunction, TMiddlewareContext>,
    options?: MiddlewareOptions,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  onError: (
    onErrorMiddleware: OnErrorMiddlewareFn<TFunction, TMiddlewareContext>,
    options?: MiddlewareOptions,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  handler: (
    handler: Handler<TFunction, TMiddlewareContext>,
  ) => ShrextHandler<TFunction, TMiddlewareContext>
  remove: (id: string, options?: RemoveOptions) => void
  clone: () => ShrextHandler<TFunction, TMiddlewareContext>
}
