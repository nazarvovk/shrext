# Shrext

[![npm version](https://img.shields.io/npm/v/shrext.svg?maxAge=1000)](https://www.npmjs.com/package/shrext)
[![Test](https://github.com/nazarvovk/shrext/actions/workflows/test.yml/badge.svg)](https://github.com/nazarvovk/shrext/actions/workflows/test.yml)
[![npm downloads](https://img.shields.io/npm/dt/shrext.svg?maxAge=1000)](https://www.npmjs.com/package/shrext)
[![license](https://img.shields.io/npm/l/shrext.svg?maxAge=1000)](https://github.com/nazarvovk/shrext/blob/master/LICENSE)

A dead simple TypeScript middleware engine.

<p align="center">
  <img src="shrext.jpg" />
</p>

Shrext is a simple tool that helps you compose reusable middleware. Inspired by [Middy](https://github.com/middyjs/middy), made for *anything,* not just AWS Lambda.

## Installation

Install using `npm`:

```bash
npm install shrext
```

## Usage

### Basic Example

```typescript
import { MiddlewareFnObject, shrext } from './src'

type ApiHandler = (req: { auth_token: string }) => unknown

type User = { token: string }
type ContextWithUser = { user: User }

const handler = shrext<ApiHandler, ContextWithUser>((context) => {
  console.log(context.user.token)
})

const withUser: MiddlewareFnObject<ApiHandler, ContextWithUser> = {
  before: async (context) => {
    const {
      args: [req],
    } = context
    const user: User = await getUser(req.auth_token)
    Object.assign(context, { user })
  },
}
// attach the middleware
handler.use(withUser)

handler({ auth_token: 'qwerty' })
// Result: qwerty
```

Alternative composition:

```typescript
shrext<ApiHandler, ContextWithUser>()
  .use(withUser)
  .handler()
```

---

There are three types of middleware: `before`, `after`, and `onError`. All of them receive a `context` object, that by default has an `args` property - array of arguments the handler is called with. You can attach properties to context, as it's passed through the middleware layers.

The middleware call order:
- `before` - order in which it's attached
- `after` - reverse attach order
- `onError` - reverse attach order, like `after`

---
Some rules and behavior to keep in mind:

  1. Handler and every middleware are always awaited, the call on instance always returns a `Promise`
  2. The instance returned from `shrext()` is mutable and every method returns self. This allows to chain method calls, as well as compose separately, as shown above. 
  3. Because of the mutability, you should use `clone()` when reusing and extending shrex handler instances.


## API Reference

### `shrext<T extends AnyFunc, TContext>(handler?: Handler<T, TContext>)`
Creates a Shrext instance.

### `use(middleware: MiddlewareFnObject<TFunction, TContext>, options?: MiddlewareOptions)`
Attaches a middleware object with `before`, `after`, or `onError` hooks.

### `before(beforeMiddleware: BeforeMiddlewareFn<T, TContext>, options?: MiddlewareOptions)`
Helper shortcut for `.use({ before })`

### `after(afterMiddleware: AfterMiddlewareFn<T, TContext>, options?: MiddlewareOptions)`
Helper shortcut for `.use({ after })`

### `onError(onErrorMiddleware: OnErrorMiddlewareFn<T, TContext>, options?: MiddlewareOptions)`
Helper shortcut for `.use({ onError })`

### `setHandler(handler: Handler<T, TContext>)`
Set the function handler. Overwrite if it was set previously.

### `remove(id: string, options?: RemoveOptions)`
Removes middleware by ID. You can pass `id` in `use()` and the helper shortcuts in the second options argument.

Optionally pass options to specify which parts of the middleware to remove.

### `clone()`
Returns a new instance with the middleware copied, that can be modified independently.


## License

Licensed under [MIT License](LICENSE). Copyright (c) 2025 [Nazarii Vovk](https://github.com/nazarvovk).