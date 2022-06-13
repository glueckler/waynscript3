import SqlString from 'sqlstring-sqlite';
import { Directory, Query } from '../types';
import db from './db';

export const logQuery = (q: string) => {
  console.log(`\nSQL:`);
  console.log(`${q}\n`);
};

export const runQuery = (q: string) => {
  const sql = q;
  logQuery(sql);
  const stmt = db.prepare(sql);
  const res = stmt.run();
  return res;
};

export const getQuery = <T>(q: string) => {
  const sql = q;
  logQuery(sql);
  const stmt = db.prepare(sql);
  const res = stmt.get();
  return res as T;
};

export const allQuery = <T>(q: string) => {
  const sql = q;
  logQuery(sql);
  const stmt = db.prepare(sql);
  const res = stmt.all();
  return res as T[];
};

export const activeDirsWhereClause = (
  activeDirs: Directory[],
  andClauses: string[]
): string => {
  return activeDirs
    .map((dir) => {
      let pathClause = `samples.path LIKE ${SqlString.escape(`%${dir.path}%`)}`;
      if (andClauses.length > 0) {
        andClauses.forEach((sql) => {
          if (!sql) return;
          pathClause = `${pathClause} AND (${sql})`;
        });
      }
      pathClause = `(${pathClause})`;
      return pathClause;
    })
    .join(' OR ');
};

export const initQuery: Query = { bpms: [], keys: [], words: [] };

export const resetDatabase = () => {
  runQuery(`DROP TABLE IF EXISTS samples_words;`);

  // samples
  runQuery(`DROP TABLE IF EXISTS samples;`);
  const createSamples = `CREATE TABLE "samples" (
    "path"	TEXT NOT NULL,
    "bpm"	INTEGER,
    "key"	TEXT,
    PRIMARY KEY("path"),
    UNIQUE("path") ON CONFLICT REPLACE
  );`;
  runQuery(createSamples);

  // directories
  runQuery(`DROP TABLE IF EXISTS directories;`);
  const createDirs = `CREATE TABLE "directories" (
    "path"	TEXT NOT NULL,
    "active"	INTEGER NOT NULL,
    PRIMARY KEY("path"),
    UNIQUE("path") ON CONFLICT REPLACE
  );`;
  runQuery(createDirs);

  // queries
  runQuery(`DROP TABLE IF EXISTS queries;`);
  const createQueries = `CREATE TABLE "queries" (
    "id"	INTEGER NOT NULL UNIQUE,
    "query"	TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  );`;
  runQuery(createQueries);

  runQuery(
    SqlString.format(`INSERT INTO queries (query) VALUES ( ? )`, [
      JSON.stringify(initQuery),
    ])
  );

  // words
  runQuery(`DROP TABLE IF EXISTS words;`);
  const createWords = `CREATE TABLE "words" (
    "word"	TEXT NOT NULL UNIQUE,
    "favorite "	INTEGER,
    PRIMARY KEY("word"),
    UNIQUE("word") ON CONFLICT IGNORE
  );`;
  runQuery(createWords);

  // samples_words
  const createSamplesWords = `CREATE TABLE "samples_words" (
    "path"	TEXT NOT NULL REFERENCES samples("path"),
    "word"	TEXT NOT NULL REFERENCES words("word")
  );`;
  runQuery(createSamplesWords);

  // // windows
  // runQuery(`DROP TABLE IF EXISTS windows;`);
  // const windowsSQL = `CREATE TABLE "windows" (
  //   "id"	INTEGER NOT NULL UNIQUE,
  //   "name"	TEXT NOT NULL UNIQUE,
  //   "width"	INTEGER NOT NULL,
  //   "height"	INTEGER NOT NULL,
  //   "x"	INTEGER,
  //   "y"	INTEGER,
  //   PRIMARY KEY("id" AUTOINCREMENT)
  // );`;
  // runQuery(windowsSQL);
  // runQuery(
  //   `INSERT INTO windows (name,width,height) VALUES ('queryWindow',900,700);`
  // );
  // runQuery(
  //   `INSERT INTO windows (name,width,height) VALUES ('listWindow',400,700);`
  // );
};
