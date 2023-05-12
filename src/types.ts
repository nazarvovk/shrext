export type FunctionWithContext<TContext = any, TReturn = any> = (context: TContext) => TReturn

export type ContextOf<T extends FunctionWithContext> = Parameters<T>[0]

export type BeforeMiddleware<
  TFunc extends FunctionWithContext = FunctionWithContext,
  TShrextContext = object,
> = (
  context: ContextOf<TFunc>,
  shrextContext: TShrextContext,
) => void | Promise<void | Awaited<ReturnType<TFunc>>>

export type AfterMiddleware<
  T extends FunctionWithContext = FunctionWithContext,
  TShrextContext = object,
> = (
  prevResult: Awaited<ReturnType<T>>,
  shrextContext: TShrextContext,
  nextContext: ContextOf<T>,
) => ReturnType<T> | Promise<ReturnType<T>>

export type OnErrorMiddleware<
  TFunc extends FunctionWithContext = FunctionWithContext,
  TShrextContext = object,
> = (
  error: unknown,
  shrextContext: TShrextContext,
  nextContext: ContextOf<TFunc>,
) => void | Awaited<ReturnType<TFunc>> | Promise<void | Awaited<ReturnType<TFunc>>>

export type MiddlewareObject<
  T extends FunctionWithContext = FunctionWithContext,
  TShrextContext = object,
> = {
  before?: BeforeMiddleware<T, TShrextContext>
  after?: AfterMiddleware<T, TShrextContext>
  onError?: OnErrorMiddleware<T, TShrextContext>
}

export type ShrextHandler<TFunction extends FunctionWithContext, TShrextContext = object> = {
  (ctx: ContextOf<TFunction>): ReturnType<TFunction> | Promise<ReturnType<TFunction>>
  use: (
    middlewareObject: MiddlewareObject<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
  before: (
    beforeMiddleware: BeforeMiddleware<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
  after: (
    afterMiddleware: AfterMiddleware<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
  onError: (
    onErrorMiddleware: OnErrorMiddleware<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
}
