type MaybePromise<T> = Awaited<T> | Promise<Awaited<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunc = (...args: any[]) => any

export type WithArgs<TBase extends object, TArgs extends unknown[]> = TBase & {
  args: TArgs
}

export type Handler<T extends AnyFunc, TContext extends object = object> = (
  context: WithArgs<TContext, Parameters<T>>,
) => ReturnType<T>

export type BeforeMiddlewareFn<T extends AnyFunc = AnyFunc, TContext extends object = object> = (
  context: WithArgs<TContext, Parameters<T>>,
) => MaybePromise<void | ReturnType<T>>

export type AfterMiddlewareFn<T extends AnyFunc = AnyFunc, TContext extends object = object> = (
  prevResult: Awaited<ReturnType<T>>,
  context: WithArgs<TContext, Parameters<T>>,
) => MaybePromise<ReturnType<T>>

export type OnErrorMiddlewareFn<T extends AnyFunc = AnyFunc, TContext extends object = object> = (
  error: unknown,
  context: WithArgs<TContext, Parameters<T>>,
  additionalErrors?: unknown[],
) => MaybePromise<void | Awaited<ReturnType<T>>>

export type Middleware<T> = { fn: T; options?: MiddlewareOptions }

export type MiddlewareInput<TFunc extends AnyFunc = AnyFunc> = TFunc | Middleware<TFunc>

export type MiddlewareFnObject<T extends AnyFunc = AnyFunc, TContext extends object = object> = {
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

export type ShrextInstanceState<T extends AnyFunc, TContext extends object> = {
  handler: Handler<T, TContext> | undefined
  before: Middleware<BeforeMiddlewareFn<T, TContext>>[]
  after: Middleware<AfterMiddlewareFn<T, TContext>>[]
  onError: Middleware<OnErrorMiddlewareFn<T, TContext>>[]
}

export interface Shrext<T extends AnyFunc = AnyFunc, TContext extends object = object> {
  (...args: Parameters<T>): Promise<ReturnType<T>>
  state: ShrextInstanceState<T, TContext>
  use: (middlewareObject: MiddlewareFnObject<T, TContext>, options?: MiddlewareOptions) => this
  before: (fn: BeforeMiddlewareFn<T, TContext>, options?: MiddlewareOptions) => this
  after: (fn: AfterMiddlewareFn<T, TContext>, options?: MiddlewareOptions) => this
  onError: (fn: OnErrorMiddlewareFn<T, TContext>, options?: MiddlewareOptions) => this
  setHandler: (handler: Handler<T, TContext>) => this
  remove: (id: string, options?: RemoveOptions) => void
  clone: () => Shrext<T, TContext>
}
