
import { Sale, SaleItem, Medication, InvoiceSettings, Client } from '@prisma/client';

interface InvoiceProps {
  sale: Sale & { items: (SaleItem & { medication: Medication })[]; client: Client };
  settings: InvoiceSettings;
}

export function Invoice({ sale, settings }: InvoiceProps) {
  return (
    <div className="p-8 bg-white text-black">
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">{settings.companyName}</h1>
          <p>{settings.companyAddress}</p>
          <p>Tél: {settings.companyPhone}</p>
          <p>Email: {settings.companyEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{settings.headerText}</h2>
          <p><span className="font-bold">Facture N°:</span> {sale.id.slice(0, 8)}</p>
          <p><span className="font-bold">Date:</span> {new Date(sale.date).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <p className="font-bold text-lg">Client: {sale.client.name}</p>
      </div>

      <table className="w-full mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left p-2">Médicament</th>
            <th className="text-right p-2">Quantité</th>
            <th className="text-right p-2">Prix Unitaire</th>
            <th className="text-right p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.medication.name}</td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">{item.priceAtSale.toLocaleString('fr-FR')} CDF</td>
              <td className="text-right p-2">{(item.quantity * item.priceAtSale).toLocaleString('fr-FR')} CDF</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/3">
          <div className="flex justify-between">
            <span className="font-bold">Sous-total:</span>
            <span>{sale.totalAmount.toLocaleString('fr-FR')} CDF</span>
          </div>
          <div className="flex justify-between font-bold text-2xl text-blue-600 mt-4">
            <span>TOTAL:</span>
            <span>{sale.totalAmount.toLocaleString('fr-FR')} CDF</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>{settings.footerText}</p>
      </div>
    </div>
  );
}
