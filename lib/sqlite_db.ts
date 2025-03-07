import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

let db: SQLiteDatabase | null = null;

async function getDatabase() {
  if (db) return db;
  
  // 打开数据库连接
  db = await open({
    filename: 'video_player.db',
    driver: Database
  });
  
  return db;
}

// 模拟PG风格的查询接口
const sqlitePool = {
  async query(text: string, params: any[] = []) {
    const database = await getDatabase();
    
    // 将PG风格的参数($1, $2)转换为SQLite风格的参数(?, ?)
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    try {
      if (sqliteText.trim().toLowerCase().startsWith('select')) {
        const rows = await database.all(sqliteText, ...params);
        return { rows };
      } else {
        const result = await database.run(sqliteText, ...params);
        return { rows: [], rowCount: result.changes };
      }
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  }
};

export default sqlitePool;
