import type { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'

export type SupportedNextFunctions = GetServerSideProps | GetStaticPaths | GetStaticProps

export type NextContextOf<T extends SupportedNextFunctions> = Parameters<T>[0]

export type BeforeMiddleware<
  T extends SupportedNextFunctions = SupportedNextFunctions,
  TShrextContext = object,
> = (
  nextContext: NextContextOf<T>,
  ShrextContext: TShrextContext,
) => void | Promise<void> | ReturnType<T>

export type AfterMiddleware<
  T extends SupportedNextFunctions = SupportedNextFunctions,
  TShrextContext = object,
> = (
  prevResult: Awaited<ReturnType<T>>,
  ShrextContext: TShrextContext,
  nextContext: NextContextOf<T>,
) => ReturnType<T> | Promise<ReturnType<T>>

export type MiddlewareObject<
  T extends SupportedNextFunctions = SupportedNextFunctions,
  TShrextContext = object,
> = {
  before?: BeforeMiddleware<T, TShrextContext>
  after?: AfterMiddleware<T, TShrextContext>
}

export type ShrextHandler<TFunction extends SupportedNextFunctions, TShrextContext = object> = {
  (ctx: NextContextOf<TFunction>): ReturnType<TFunction> | Promise<ReturnType<TFunction>>
  use: (
    middlewareObject: MiddlewareObject<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
  before: (
    beforeMiddleware: BeforeMiddleware<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
  after: (
    afterMiddleware: AfterMiddleware<TFunction, TShrextContext>,
  ) => ShrextHandler<TFunction, TShrextContext>
}
