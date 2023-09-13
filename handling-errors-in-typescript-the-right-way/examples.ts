/**
 * Type guard to check if an `unknown` value is an `Error` object.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is an `Error` object, otherwise `false`.
 */
export const isError = (value: unknown): value is Error =>
  !!value &&
  typeof value === 'object' &&
  'message' in value &&
  typeof value.message === 'string' &&
  'stack' in value &&
  typeof value.stack === 'string'

const logError = (message: string, error: unknown): void => {
  if (isError(error)) {
    console.log(message, error.stack)
  } else {
    try {
      console.log(
        new Error(
          `Unexpected value thrown: ${
            typeof error === 'object' ? JSON.stringify(error) : String(error)
          }`
        ).stack
      )
    } catch {
      console.log(
        message,
        new Error(`Unexpected value thrown: non-stringifiable object`).stack
      )
    }
  }
}

try {
  const circularObject = { self: {} }
  circularObject.self = circularObject
  throw circularObject
} catch (error) {
  logError('Error while throwing a circular object:', error)
}

export const doStuff = async (): Promise<void> => {
  try {
    const fetchDataResponse = await fetch('https://api.example.com/fetchData')
    if (!fetchDataResponse.ok) {
      throw new Error(`Error fetching data: ${fetchDataResponse.statusText}`)
    }

    let fetchData
    try {
      fetchData = (await fetchDataResponse.json()) as unknown
    } catch {
      throw new Error('Failed to parse response as JSON.')
    }

    if (
      !fetchData ||
      typeof fetchData !== 'object' ||
      !('data' in fetchData) ||
      !fetchData.data
    ) {
      throw new Error('Fetched data is not in the expected format.')
    }

    const storeDataResponse = await fetch('https://api.example.com/storeData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchData),
    })
    if (!storeDataResponse.ok) {
      throw new Error(`Error storing data: ${storeDataResponse.statusText}`)
    }
  } catch (error) {
    logError('An error occurred:', error)
  }
}

export const doStuffV2 = async (): Promise<void> => {
  try {
    const fetchDataResponse = await fetch('https://api.example.com/fetchData')
    const fetchData = (await fetchDataResponse.json()) as unknown

    if (
      !fetchData ||
      typeof fetchData !== 'object' ||
      !('data' in fetchData) ||
      !fetchData.data
    ) {
      throw new Error('Fetched data is not in the expected format.')
    }

    const storeDataResponse = await fetch('https://api.example.com/storeData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchData),
    })

    if (!storeDataResponse.ok) {
      throw new Error(`Error storing data: ${storeDataResponse.statusText}`)
    }
  } catch (error) {
    logError('An error occurred:', error)
  }
}

/** An `Error` object to safely handle `unknown` values being thrown. */
export class NormalizedError extends Error {
  /** The error's stack or a fallback to the `message` if the stack is unavailable. */
  stack: string = ''
  /** The original value that was thrown. */
  originalValue: unknown

  /**
   * Initializes a new instance of the `NormalizedError` class.
   *
   * @param error - An `Error` object.
   * @param originalValue - The original value that was thrown.
   */
  constructor(error: Error, originalValue?: unknown) {
    super(error.message)
    this.stack = error.stack ?? this.message
    this.originalValue = originalValue ?? error

    // Set the prototype explicitly, for `instanceof` to work correctly when transpiled to ES5.
    Object.setPrototypeOf(this, NormalizedError.prototype)
  }
}

/**
 * Converts an `unknown` value that was thrown into a `NormalizedError` object.
 *
 * @param value - An `unknown` value.
 *
 * @returns A `NormalizedError` object.
 */
export const toNormalizedError = <E>(
  value: E extends NormalizedError ? never : E
): NormalizedError => {
  if (isError(value)) {
    return new NormalizedError(value)
  } else {
    try {
      return new NormalizedError(
        new Error(
          `Unexpected value thrown: ${
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          }`
        ),
        value
      )
    } catch {
      return new NormalizedError(
        new Error(`Unexpected value thrown: non-stringifiable object`),
        value
      )
    }
  }
}

/**
 * Type guard to check if an `unknown` value is a `NormalizedError` object.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a `NormalizedError` object, otherwise `false`.
 */
export const isNormalizedError = (value: unknown): value is NormalizedError =>
  isError(value) && 'originalValue' in value && value.stack !== undefined

/**
 * Type guard to check if an `unknown` function call result is a `Promise`.
 *
 * @param result - The function call result to check.
 *
 * @returns `true` if the value is a `Promise`, otherwise `false`.
 */
export const isPromise = (result: unknown): result is Promise<unknown> =>
  !!result &&
  typeof result === 'object' &&
  'then' in result &&
  typeof result.then === 'function' &&
  'catch' in result &&
  typeof result.catch === 'function'

type NoThrowResult<A> = A extends Promise<infer U>
  ? Promise<U | NormalizedError>
  : A | NormalizedError

/**
 * Perform an action without throwing errors.
 *
 * Try/catch blocks can be hard to read and can cause scoping issues. This wrapper
 * avoids those pitfalls by returning the appropriate result based on whether the function
 * executed successfully or not.
 *
 * @param action - The action to perform.
 *
 * @returns The result of the action when successful, or a `NormalizedError` object otherwise.
 */
export const noThrow = <A>(action: () => A): NoThrowResult<A> => {
  try {
    const result = action()
    if (isPromise(result)) {
      return result.catch(toNormalizedError) as NoThrowResult<A>
    }
    return result as NoThrowResult<A>
  } catch (error) {
    return toNormalizedError(error) as NoThrowResult<A>
  }
}

export const doStuffV3 = async (): Promise<void> => {
  const fetchDataResponse = await noThrow(() =>
    fetch('https://api.example.com/fetchData')
  )
  if (isNormalizedError(fetchDataResponse)) {
    return console.log('Error fetching data:', fetchDataResponse.stack)
  }

  const fetchDataText = await fetchDataResponse.text()

  if (!fetchDataResponse.ok) {
    return console.log(
      `Unexpected response while fetching data. Status: ${fetchDataResponse.status} | Status text: ${fetchDataResponse.statusText} | Body: ${fetchDataText}`,
      fetchDataResponse
    )
  }

  const fetchData = noThrow(() => JSON.parse(fetchDataText) as unknown)

  if (isNormalizedError(fetchData)) {
    return console.log(
      `Failed to parse response as JSON: ${fetchDataText}`,
      fetchData.stack
    )
  }

  if (
    !fetchData ||
    typeof fetchData !== 'object' ||
    !('data' in fetchData) ||
    !fetchData.data
  ) {
    return console.log(
      `Fetched data is not in the expected format. Body: ${fetchDataText}`,
      toNormalizedError(new Error('Invalid data format')).stack
    )
  }

  const storeDataResponse = await noThrow(() =>
    fetch('https://api.example.com/storeData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchData),
    })
  )

  if (isNormalizedError(storeDataResponse)) {
    return console.log('Error storing data:', storeDataResponse.stack)
  }

  const storeDataText = await storeDataResponse.text()

  if (!storeDataResponse.ok) {
    return console.log(
      `Unexpected response while storing data. Status: ${storeDataResponse.status} | Status text: ${storeDataResponse.statusText} | Body: ${storeDataText}`,
      storeDataText
    )
  }
}
