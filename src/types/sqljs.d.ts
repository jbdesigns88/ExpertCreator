declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  export interface SqlJsStatement {
    run(params?: unknown[]): void;
    free(): void;
  }

  export interface Database {
    exec(sql: string): QueryExecResult[];
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): SqlJsStatement;
    export(): Uint8Array;
  }

  type InitConfig = { locateFile?: (file: string) => string } | undefined;

  const initSqlJs: (config?: InitConfig) => Promise<{ Database: new (...args: unknown[]) => Database }>;
  export default initSqlJs;
}
