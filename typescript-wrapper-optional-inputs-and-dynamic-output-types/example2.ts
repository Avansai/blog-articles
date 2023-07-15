type NextApiRequest = { body: any }
type NextApiResponse = { json: (arg: unknown) => void }

const getSessionUserId = (): number | null => {
  return Math.random() || null
}

const parseNextApiRequestBody = <B = object>(
  request: NextApiRequest
): Partial<B> | null => {
  try {
    const parsedBody = JSON.parse(request.body as string) as unknown
    return typeof parsedBody === 'object' ? parsedBody : null
  } catch {
    return null
  }
}

type Expand<T> = T extends ((...args: any[]) => any) | Date | RegExp
  ? T
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<Expand<K>, Expand<V>>
  : T extends ReadonlySet<infer U>
  ? Set<Expand<U>>
  : T extends ReadonlyArray<unknown>
  ? `${bigint}` extends `${keyof T & any}`
    ? { [K in keyof T]: Expand<T[K]> }
    : Expand<T[number]>[]
  : T extends object
  ? { [K in keyof T]: Expand<T[K]> }
  : T

type Options = {
  requiresAuthentication?: boolean
}

type CallbackOptions<B = never, O extends Options = Options> = {
  request: NextApiRequest
  response: NextApiResponse
  parsedRequestBody: B
} & (O['requiresAuthentication'] extends true ? { userId: string } : object)

export const handleRequest =
  <B = never, O extends Options = Options>(
    options: O,
    callback: (options: CallbackOptions<B, O>) => Promise<void>
  ) =>
  async (request: NextApiRequest, response: NextApiResponse) => {
    // If the user is not found, we can return a response right away.
    const userId = getSessionUserId()
    if (options.requiresAuthentication && !userId) {
      return void response.json({ error: 'missing authentication' })
    }

    return callback({
      request,
      response,
      parsedRequestBody: {} as B,
      ...(options.requiresAuthentication ? { userId } : {}),
    } as CallbackOptions<B, O>)
  }

const handlerWithBodyType = handleRequest<{ hello: string }>(
  {},
  async (options) => {
    // `options.parsedRequestBody` is of type `{ hello: string }`
    void typeof options?.parsedRequestBody
    //                   ^?
  }
)

const handlerWithoutBodyType = handleRequest({}, async (options) => {
  // `options.parsedRequestBody` is of type `never`
  void typeof options?.parsedRequestBody
  //                   ^?
})
