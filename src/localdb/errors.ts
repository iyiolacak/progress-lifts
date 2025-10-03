export class DatabaseError extends Error {
  constructor(msg: string, public operation?: string, public originalError?: unknown) {
    super(msg); this.name = "DatabaseError";
  }
}
export class EntryNotFoundError extends DatabaseError {
  constructor(entryId: string) { super(`Entry not found: ${entryId}`, "findEntry"); }
}
export class InvalidJobStateError extends DatabaseError {
  constructor(jobId: string, cur: string, exp: string) { super(`Job ${jobId} is '${cur}', expected '${exp}'`, "startJob"); }
}
