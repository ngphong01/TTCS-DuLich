declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): { changes: number; lastInsertRowid: number };
    all(...params: any[]): any[];
    get(...params: any[]): any;
  }

  export default class Database {
    constructor(filename: string);
  }
}
