import { shrext } from './shrext'

describe('before middleware', () => {
  it('should throw if no handler', async () => {
    const shrextHandler = shrext()

    await expect(() => shrextHandler()).rejects.toThrow()
  })

  it('should be called', async () => {
    const beforeMiddleware = jest.fn()
    const handler = jest.fn()
    const shrextHandler = shrext().before(beforeMiddleware).handler(handler)

    await shrextHandler({})
    expect(beforeMiddleware).toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
  })

  it('should be able to modify context', async () => {
    const beforeMiddleware = jest.fn((ctx) => {
      ctx.foo = 'bar'
    })
    const handler = jest.fn()
    const shrextHandler = shrext(handler).before(beforeMiddleware)
    await shrextHandler(1, 2)
    expect(beforeMiddleware).toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveBeenCalledWith({ args: [1, 2], foo: 'bar' })
  })
})

describe('after middleware', () => {
  it('should be called', async () => {
    const afterMiddleware = jest.fn()
    const handler = jest.fn()
    const shrextHandler = shrext(handler)
    shrextHandler.after(afterMiddleware)
    await shrextHandler({})
    expect(afterMiddleware).toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
  })

  it('should be able to modify return', async () => {
    const afterMiddleware = jest.fn()
    const handler = jest.fn(() => ({ handlerValue: 'test' }))
    const shrextHandler = shrext(handler)
    shrextHandler.after(afterMiddleware)
    afterMiddleware.mockImplementationOnce((result) => {
      return { ...result, addedAfter: 'yes' }
    })
    const res = await shrextHandler({})
    expect(handler).toHaveBeenCalled()
    expect(afterMiddleware).toHaveBeenCalled()
    expect(afterMiddleware).toHaveBeenCalledWith({ handlerValue: 'test' }, { args: [{}] })
    expect(res).toEqual({ handlerValue: 'test', addedAfter: 'yes' })
  })
})

describe('onError middleware', () => {
  it('should be called', async () => {
    const onErrorMiddleware0 = jest.fn()
    const onErrorMiddleware1 = jest.fn((error) => {
      return { addedOnError: 'yes', error }
    })

    const handler = jest.fn(() => {
      throw new Error('test')
    })
    const shrextHandler = shrext(handler)
    shrextHandler.onError(onErrorMiddleware0)
    shrextHandler.onError(onErrorMiddleware1)
    const res = await shrextHandler({})
    expect(onErrorMiddleware1).toHaveBeenCalledWith(expect.any(Error), { args: [{}] }, [])
    expect(onErrorMiddleware1).toHaveBeenCalled()
    expect(onErrorMiddleware1).toHaveBeenCalledWith(expect.any(Error), { args: [{}] }, [])
    expect(handler).toHaveBeenCalled()
    expect(res).toMatchInlineSnapshot(`
        {
          "addedOnError": "yes",
          "error": [Error: test],
        }
      `)
  })

  it('should pass to the next onError middleware if one throws', async () => {
    const handler = jest.fn(() => {
      throw new Error('test')
    })

    const onErrorMiddleware0 = jest.fn(() => {
      throw new Error('middleware error')
    })
    const onErrorMiddleware1 = jest.fn((error) => {
      return { addedOnError: 'yes', error }
    })

    const shrextHandler = shrext(handler)
      // the order of onError is reversed (last attached gets called first), same as after middleware. So we attach it in reverse order
      .onError(onErrorMiddleware1)
      .onError(onErrorMiddleware0)
    const res = await shrextHandler({})

    expect(onErrorMiddleware0).toHaveBeenCalledTimes(1)
    expect(onErrorMiddleware0).toHaveBeenCalledWith(expect.any(Error), { args: [{}] }, [])
    expect(onErrorMiddleware1).toHaveBeenCalledTimes(1)
    expect(onErrorMiddleware1).toHaveBeenCalledWith(expect.any(Error), { args: [{}] }, [
      expect.any(Error),
    ])
    expect(handler).toHaveBeenCalled()
    expect(res).toMatchInlineSnapshot(`
        {
          "addedOnError": "yes",
          "error": [Error: test],
        }
      `)
  })
})

describe('remove middleware', () => {
  it("doesn't call the removed middleware", async () => {
    const beforeMiddleware = jest.fn()
    const handler = jest.fn()
    const shrextHandler = shrext(handler).before(beforeMiddleware, { id: 'test' })

    shrextHandler.remove('test')
    await shrextHandler({})

    expect(beforeMiddleware).not.toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
  })

  it('removes only the specified middlewares', async () => {
    const beforeMiddleware = jest.fn()
    const afterMiddleware = jest.fn()
    const onErrorMiddleware = jest.fn()
    const handler = jest.fn(() => {
      throw new Error('test error') // trigger onError
    })
    const shrextHandler = shrext(handler).use(
      {
        before: beforeMiddleware,
        after: afterMiddleware,
        onError: onErrorMiddleware,
      },
      { id: 'test' },
    )

    shrextHandler.remove('test', { before: true, after: true })

    await expect(shrextHandler({})).rejects.toThrow('test error')

    expect(beforeMiddleware).not.toHaveBeenCalled()
    expect(afterMiddleware).not.toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
    expect(onErrorMiddleware).toHaveBeenCalled()
  })
})

describe('clone', () => {
  it('should mutate the instance and call both middlewares', async () => {
    const handler = jest.fn()
    const afterMiddleware = jest.fn()
    const shrextHandler = shrext(handler)
    shrextHandler.after(afterMiddleware)

    const afterMiddleware2 = jest.fn()
    // the instance is reused and mutated
    const newHandler = shrextHandler.after(afterMiddleware2)

    await newHandler()

    expect(handler).toHaveBeenCalled()
    expect(afterMiddleware).toHaveBeenCalled()
    expect(afterMiddleware2).toHaveBeenCalled()
  })

  it('should clone the instance and call only the cloned', async () => {
    const handler = jest.fn()
    const afterMiddleware = jest.fn()
    const shrextHandler = shrext(handler)
    // clone the instance before mutating
    shrextHandler.clone().after(afterMiddleware)

    const afterMiddleware2 = jest.fn()
    const newHandler = shrextHandler.after(afterMiddleware2)

    await newHandler()

    expect(handler).toHaveBeenCalled()
    expect(afterMiddleware).not.toHaveBeenCalled()
    expect(afterMiddleware2).toHaveBeenCalled()
  })
})

it('works with api routes', async () => {
  const handler = jest.fn(({ args: [req, res] }) => {
    res.send(req.body)
  })
  const req = { body: 'test' }
  const res = { send: jest.fn() }
  const shrextHandler = shrext(handler)
  await shrextHandler(req, res)

  expect(handler).toHaveBeenCalled()
  expect(handler).toHaveBeenCalledWith({ args: [req, res] })
  expect(res.send).toHaveBeenCalled()
  expect(res.send).toHaveBeenCalledWith(req.body)
})
