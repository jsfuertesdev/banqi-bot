import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

// Function to execute a BigQuery query
async function queryBigQuery(query: string): Promise<any[]> {
  try {
    const [rows] = await bigquery.query({query});
    console.log(rows);
    return rows;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Export the function for use in other files
export { queryBigQuery };

// Example usage (commented out)
/*
queryBigQuery("INSERT INTO `banqi-394708.pruebasbot.pruebaenvio` (numero_de_telefono, mensaje, opcion) VALUES (300123123, 'estamos recaudando confirma', '1')")
  .catch(console.error);

queryBigQuery(`SELECT * FROM \`banqi-394708.pruebasbot.pruebaenvio\``)
  .catch(console.error);
*/
