import sqlite3 from 'sqlite3';
sqlite3.verbose();

export const db = new sqlite3.Database('./data.db');

/**
 * Quote SQLite identifiers safely
 * @param {string} ident
 */
export function quoteIdentifier(ident) {
  return `"${ident.replace(/"/g, '""')}"`;
}

/**
 * Ensure a table exists, given a name and array of {name, type} columns
 * @param {string} tableName
 * @param {{name: string, type: string}[]} columns
 */
export function ensureTable(tableName, columns) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Table name must be a string');
  }

  const colsSql = columns.map(c => {
    if (!c.name || typeof c.name !== 'string') {
      throw new Error(`Invalid column name: ${JSON.stringify(c)}`);
    }
    return `${quoteIdentifier(c.name)} ${c.type}`;
  }).join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (${colsSql})`;
  console.log('Executing SQL:', sql); // debug
  db.run(sql);
}
