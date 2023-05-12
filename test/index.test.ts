import { OnErrorMiddleware, shrext } from "../src";

describe(shrext.name, () => {
  describe("before middleware", () => {
    it("should be called", async () => {
      const beforeMiddleware = jest.fn();
      const handler = jest.fn();
      const shrextHandler = shrext<(ctx: {}) => void>(handler);
      shrextHandler.before(beforeMiddleware);
      await shrextHandler({});
      expect(beforeMiddleware).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it("should be able to modify context", async () => {
      const beforeMiddleware = jest.fn();
      const handler = jest.fn();
      const shrextHandler = shrext(handler);
      shrextHandler.before(beforeMiddleware);
      beforeMiddleware.mockImplementationOnce((e, ctx) => {
        ctx.foo = "bar";
      });
      await shrextHandler({});
      expect(beforeMiddleware).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledWith({}, { foo: "bar" });
    });
  });

  describe("after middleware", () => {
    it("should be called", async () => {
      const afterMiddleware = jest.fn();
      const handler = jest.fn();
      const shrextHandler = shrext(handler);
      shrextHandler.after(afterMiddleware);
      await shrextHandler({});
      expect(afterMiddleware).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it("should be able to modify return", async () => {
      const afterMiddleware = jest.fn();
      const handler = jest.fn(() => ({ handlerValue: "test" }));
      const shrextHandler = shrext(handler);
      shrextHandler.after(afterMiddleware);
      afterMiddleware.mockImplementationOnce((result) => {
        return { ...result, addedAfter: "yes" };
      });
      const res = await shrextHandler({});
      expect(handler).toHaveBeenCalled();
      expect(afterMiddleware).toHaveBeenCalled();
      expect(res).toEqual({ handlerValue: "test", addedAfter: "yes" });
    });
  });

  describe("onError middleware", () => {
    it("should be called", async () => {
      const onErrorMiddleware = jest.fn((error) => {
        return { addedOnError: "yes", error };
      }) as OnErrorMiddleware;
      const handler = jest.fn(() => {
        throw new Error("test");
      });
      const shrextHandler = shrext(handler);
      shrextHandler.onError(onErrorMiddleware);
      const res = await shrextHandler({});
      expect(onErrorMiddleware).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(res).toMatchInlineSnapshot(`
        {
          "addedOnError": "yes",
          "error": [Error: test],
        }
      `);
    });
  });
});
