export type AnyFunc = (...args: any[]) => any

export type ContextWithArgs<T extends AnyFunc, TContext = object> = TContext & {
  args: Parameters<T>
}

export type Handler<T extends AnyFunc, TContext = object> = (
  context: ContextWithArgs<T, TContext>,
) => ReturnType<T>

export type BeforeMiddlewareFn<T extends AnyFunc = AnyFunc, TContext = object> = (
  context: ContextWithArgs<T, TContext>,
) => void | Promise<void | Awaited<ReturnType<T>>>

export type AfterMiddlewareFn<T extends AnyFunc = AnyFunc, TContext = object> = (
  prevResult: Awaited<ReturnType<T>>,
  context: ContextWithArgs<T, TContext>,
) => ReturnType<T> | Promise<ReturnType<T>>

export type OnErrorMiddlewareFn<T extends AnyFunc = AnyFunc, TContext = object> = (
  error: unknown,
  context: ContextWithArgs<T, TContext>,
  additionalErrors?: unknown[],
) => void | Awaited<ReturnType<T>> | Promise<void | Awaited<ReturnType<T>>>

export type Middleware<T> = { fn: T; options?: MiddlewareOptions }

export type MiddlewareInput<TFunc extends AnyFunc = AnyFunc> = TFunc | Middleware<TFunc>

export type MiddlewareFnObject<T extends AnyFunc = AnyFunc, TContext = object> = {
  before?: BeforeMiddlewareFn<T, TContext>
  after?: AfterMiddlewareFn<T, TContext>
  onError?: OnErrorMiddlewareFn<T, TContext>
}

export type MiddlewareOptions = {
  id: string
}

export type RemoveOptions = {
  before?: boolean
  after?: boolean
  onError?: boolean
}

export type ShrextInstanceState<THandler extends AnyFunc, TContext> = {
  handler: Handler<THandler, TContext> | undefined
  before: Middleware<BeforeMiddlewareFn<THandler, TContext>>[]
  after: Middleware<AfterMiddlewareFn<THandler, TContext>>[]
  onError: Middleware<OnErrorMiddlewareFn<THandler, TContext>>[]
}

export type Shrext<TFunction extends AnyFunc, TContext = object> = {
  (...args: Parameters<TFunction>): ReturnType<TFunction> | Promise<ReturnType<TFunction>>
  state: ShrextInstanceState<TFunction, TContext>
  use: (
    middlewareObject: MiddlewareFnObject<TFunction, TContext>,
    options?: MiddlewareOptions,
  ) => Shrext<TFunction, TContext>
  before: (
    beforeMiddleware: BeforeMiddlewareFn<TFunction, TContext>,
    options?: MiddlewareOptions,
  ) => Shrext<TFunction, TContext>
  after: (
    afterMiddleware: AfterMiddlewareFn<TFunction, TContext>,
    options?: MiddlewareOptions,
  ) => Shrext<TFunction, TContext>
  onError: (
    onErrorMiddleware: OnErrorMiddlewareFn<TFunction, TContext>,
    options?: MiddlewareOptions,
  ) => Shrext<TFunction, TContext>
  setHandler: (handler: Handler<TFunction, TContext>) => Shrext<TFunction, TContext>
  remove: (id: string, options?: RemoveOptions) => void
  clone: () => Shrext<TFunction, TContext>
}
