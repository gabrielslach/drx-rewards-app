export default {
    selectAll: (tableName: string) => `SELECT * FROM ${tableName}`,
    selectID: (tableName: string) => `SELECT * FROM ${tableName} WHERE id=$1`,
    insert: (tableName: string, fieldKeys: string[]) => `INSERT INTO ${tableName}(${fieldKeys.toString()}) VALUES(${fieldKeys.map((_, i) => `$${i + 1}`).toString()})`,

}