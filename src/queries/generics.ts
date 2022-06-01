export default {
    selectAll: (tableName: string) => `SELECT * FROM ${tableName}`,
    selectID: (tableName: string) => `SELECT * FROM ${tableName} WHERE id=$1`,
    insert: (tableName: string, fieldKeys: string[]) => `INSERT INTO ${tableName}(${fieldKeys.toString()}) VALUES(${fieldKeys.map((_, i) => `$${i + 1}`).toString()})`,
    aggregatePoints: (type: string) => `
        SELECT COALESCE(SUM(T.points)) AS total_points
        FROM transactions t 
        INNER JOIN categories cat ON t.category_id = cat.id
        WHERE cat.type = '${type}' AND t.customer_id = $1
        GROUP BY (cat.type);
        `,

}