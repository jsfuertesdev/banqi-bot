import { BigQuery } from '@google-cloud/bigquery';

export class BigQueryDB {
    private bigQuery: BigQuery;
    private datasetId: string;
    private tableId: string;

    constructor(datasetId: string, tableId: string) {
        this.bigQuery = new BigQuery();
        this.datasetId = datasetId;
        this.tableId = tableId;
    }

    async saveEvent(event: any): Promise<void> {
        const dataset = this.bigQuery.dataset(this.datasetId);
        const table = dataset.table(this.tableId);
        await table.insert(event);
    }

    async getEvents(query: string): Promise<any[]> {
        const [rows] = await this.bigQuery.query(query);
        return rows;
    }
}