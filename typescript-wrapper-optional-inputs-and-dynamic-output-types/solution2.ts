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

// Handle request with authentication and body parsing
export const handleRequestWithBody =
  <B = never>(
    callback: (options: CallbackOptionsWithBody<B>) => Promise<void>
  ) =>
  async (request: NextApiRequest, response: NextApiResponse) => {
    // Check if the request's body is valid.
    const parsedRequestBody = parseNextApiRequestBody<B>(request)
    if (!parsedRequestBody) {
      return void response.json({ error: 'invalid payload' })
    }

    return callback({
      request,
      response,
      parsedRequestBody,
    })
  }

type CallbackOptionsWithBody<B = never> = {
  request: NextApiRequest
  response: NextApiResponse
  parsedRequestBody: Partial<B>
}

// Handle request with authentication only
export const handleRequestWithAuth =
  (callback: (options: CallbackOptionsWithAuth) => Promise<void>) =>
  async (request: NextApiRequest, response: NextApiResponse) => {
    // If the user is not found, we can return a response right away.
    const userId = getSessionUserId()
    if (!userId) {
      return void response.json({ error: 'missing authentication' })
    }

    return callback({
      request,
      response,
      userId,
    })
  }

type CallbackOptionsWithAuth = {
  request: NextApiRequest
  response: NextApiResponse
  userId: number
}

const handlerWithBodyType = handleRequestWithBody<{ hello: string }>(
  async (options) => {
    // `options.parsedRequestBody` is of type `{ hello: string }`
    void typeof options?.parsedRequestBody
    //                   ^?
  }
)

const handlerWithAuth = handleRequestWithAuth(async (options) => {
  // `options` contains `request` and `response` and `userId` and not `parsedRequestBody` as expected.
  const expandedOptions: Expand<typeof options> = options
  //    ^?
})
