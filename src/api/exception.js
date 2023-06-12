class ServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CustomError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export { ServiceError }
