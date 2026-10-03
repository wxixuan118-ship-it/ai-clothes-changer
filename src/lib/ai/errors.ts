/**
 * The provider refused the input or output on content-safety grounds. The
 * generate action refunds and tells the user the edit isn't allowed — a
 * retry with the same input would be refused again.
 */
export class ContentBlockedError extends Error {
  constructor(readonly code: string) {
    super(`content blocked by provider (${code})`);
    this.name = "ContentBlockedError";
  }
}

/** The provider kept throttling us (shared rate limit) — refund, retry later. */
export class ProviderBusyError extends Error {
  constructor(readonly code: string) {
    super(`provider busy (${code})`);
    this.name = "ProviderBusyError";
  }
}
