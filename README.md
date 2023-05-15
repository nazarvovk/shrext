# Shrext - simple middleware ~~for Next.js Data Fetching Functions~~.
<!-- badges -->
[![npm version](https://badge.fury.io/js/shrext.svg)](https://badge.fury.io/js/shrext)


<p align="center">
  <img src="https://raw.githubusercontent.com/nazarvovk/shrext/main/shrext.jpg" />
</p>

Simple tool to make composable middleware, initially designed for Next.js data fetching functions. Inspired by [Middy](https://github.com/middyjs/middy), ~~but like, you know, for Next.js~~.
**In fact, it can be used with any function now, not just Next's. I'm still keeping the name though, because it's wonderfully stupid.**

> Dreamworks, please don't sue me.

## Installation

```bash
npm install shrext
```
Or use any other package manager, I'm not your mom.

## Usage

Define a middleware:
```typescript
import type { MiddlewareObject } from 'shrext'

// This is a middleware that adds a database to the context
// and disconnects it after the handler has run
const withDatabase: MiddlewareObject = {
  before: async (context) => {
    // add the database to the context, so it can be used in the handler and other middleware
    Object.assign(context, {
      database: new Database(),
    })
  },
  after: async (result, context) => {
    // other middleware can modify the context, so we need to check if the database is still there
    if ('database' in context && context.database instanceof Database) {
      await context.database.disconnect()
    }
  },
}
```

Then, in the page file:
```typescript
import { shrext } from 'shrext'

export const getServerSideProps = shrext<GetServerSideProps, { database: Database }>(
  async (context) => {
    const { database, args } = context
    const [{ params }] = args // args is an array of arguments passed to the handler

    const data = await database.getSomething(params?.id)

    return { props: { data } }
  },
).use(withDatabase)
```

Here, used the same way with Next's `getStaticProps` and `getStaticPaths`.
Adds a prop `withBackground` to the result of `getStaticProps`:
```typescript
export const getStaticProps = shrext<GetStaticProps>(
  async (context) => {
    // ... something here
    return { props: { data } }
  },
).after((result) => {
  if ('props' in result) {
    Object.assign(result.props, { withBackground: true })
  }
  return result
})
```

Or here's a handy one, that removes undefined values from props, so Next.js doesn't complain about serialization:
```typescript
export function deepOmitUndefinedEntries<T extends object>(object: T): T {
  const result = Array.isArray(object) ? [] : {}
  for (const key in object) {
    const value = object[key]
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, { [key]: deepOmitUndefinedEntries(value) })
    } else if (value !== undefined) {
      Object.assign(result, { [key]: value })
    }
  }
  return result as T
}

export const omitUndefined: AfterMiddleware = (result) => {
  if ('props' in result) {
    result.props = deepOmitUndefinedEntries(result.props)
  }
  return result
}
```

Usage:
```typescript
export const getStaticProps = shrext<GetStaticProps>(
  async (context) => {
    // ... something here
    return { props: { data: {
      a: 1,
      b: undefined,
      c: {
        d: 2,
        e: undefined,
      },
    } } }
  },
).after(omitUndefined)
```

Page props will be:
```typescript
{
  data: {
    a: 1,
    c: {
      d: 2,
    },
  },
}
```

## License

Licensed under [MIT License](LICENSE). Copyright (c) 2023 [Nazar Vovk](https://github.com/nazarvovk).