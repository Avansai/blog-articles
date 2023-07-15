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
  parseBody?: boolean
}

type CallbackOptions<B = never, O extends Options = Options> = {
  request: NextApiRequest
  response: NextApiResponse
} & (O extends { requiresAuthentication: true } ? { userId: string } : object) &
  (O extends { parseBody: true } ? { parsedRequestBody: B } : object)

const handleRequest =
  <O extends Options>(options: O) =>
  <B = never>(callback: (options: CallbackOptions<B, O>) => Promise<void>) =>
  async (request: NextApiRequest, response: NextApiResponse) => {
    // If the user is not found, we can return a response right away.
    const userId = getSessionUserId()

    if (options.requiresAuthentication && !userId) {
      return void response.json({ error: 'missing authentication' })
    }

    // Check if the request's body is valid.
    const parsedRequestBody = options.parseBody
      ? parseNextApiRequestBody(request)
      : undefined

    if (options.parseBody && !parsedRequestBody) {
      return void response.json({ error: 'invalid payload' })
    }

    return callback({
      request,
      response,
      ...(options.parseBody ? { parsedRequestBody } : {}),
      ...(options.requiresAuthentication ? { userId } : {}),
    } as CallbackOptions<B, O>)
  }

const handlerWithBodyType = handleRequest({ parseBody: true })<{
  hello: string
}>(async (options) => {
  // `options.parsedRequestBody` is of type `{ hello: string }`
  void typeof options?.parsedRequestBody
  //                   ^?
})

const handlerWithAuth = handleRequest({ requiresAuthentication: true })(
  async (options) => {
    // `options` contains `request` and `response` and `userId` and not `parsedRequestBody` as expected.
    const expandedOptions: Expand<typeof options> = options
    //    ^?
  }
)
