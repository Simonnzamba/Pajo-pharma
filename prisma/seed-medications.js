const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.resolve(__dirname, '../Liste_de_500_M_dicaments.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  parse(fileContent, {
    delimiter: ',',
    columns: true,
    skip_empty_lines: true,
  }, async (error, records) => {
    if (error) {
      console.error('Error parsing CSV:', error);
      return;
    }

    console.log(`Found ${records.length} records in CSV.`);

    for (const record of records) {
      try {
        const [month, year] = record['Date d’Expiration'].split('/');
        const expirationDate = new Date(parseInt(year), parseInt(month) - 1, 1); // Day is 1st of the month

        await prisma.medication.create({
          data: {
            name: record['Nom du Médicament'],
            price: parseFloat(record['Prix (CDF)']),
            quantity: parseInt(record['Stock Disponible']),
            expirationDate: expirationDate,
            barcode: uuidv4(), // Generate a unique barcode
          },
        });
        console.log(`Added ${record['Nom du Médicament']}`);
      } catch (e) {
        console.error(`Failed to add ${record['Nom du Médicament']}:`, e);
      }
    }
    console.log('Medication import complete.');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
