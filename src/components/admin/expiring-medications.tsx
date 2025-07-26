
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function getExpiringMedications() {
  const today = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);

  return await prisma.medication.findMany({
    where: {
      expirationDate: {
        lte: sixtyDaysFromNow,
        gte: today,
      },
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });
}

export async function ExpiringMedications() {
  const medications = await getExpiringMedications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Médicaments Expirant Bientôt</CardTitle>
      </CardHeader>
      <CardContent>
        {medications.map((medication) => (
          <div key={medication.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-b-0">
            <span className="font-medium truncate">{medication.name}</span>
            <span className="text-sm text-orange-500 whitespace-nowrap">
              Expire le {new Date(medication.expirationDate).toLocaleDateString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
