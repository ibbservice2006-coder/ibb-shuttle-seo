import { PricingTable as PricingTableType } from "@/data/pricingData";
import { currencies } from "@/data/pricingData";

interface PricingTableProps {
  table: PricingTableType;
  currencyCode: string;
  formatPrice: (price: number, symbol: string) => string;
}

const PricingTable = ({ table, currencyCode, formatPrice }: PricingTableProps) => {
  const currency = currencies.find((c) => c.code === currencyCode) || currencies[0];

  return (
    <div className="mb-6">
      {/* Table Title - matching spec: font-size 23px, font-weight bold, color white */}
      <p className="text-[23px] font-bold text-white mb-2">
        {table.title}
      </p>

      {/* Table Content - matching spec exactly */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontFamily: 'Arial, sans-serif' }}>
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th
                  key={header}
                  className="text-center"
                  style={{
                    border: '2.3px solid #87CEEB',
                    padding: '5px 8px',
                    backgroundColor: '#ffffff',
                    color: '#2d4f4f',
                    fontSize: '1.2em',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.items.map((item) => (
              <tr key={item.destination}>
                <td
                  className="text-center"
                  style={{
                    border: '2.3px solid #87CEEB',
                    padding: '8px',
                    backgroundColor: '#2d4f4f',
                    color: 'white',
                  }}
                >
                  {item.destination}
                </td>
                {item.oneWay !== undefined && (
                  <td
                    className="text-center"
                    style={{
                      border: '2.3px solid #87CEEB',
                      padding: '8px',
                      backgroundColor: '#2d4f4f',
                      color: 'white',
                    }}
                  >
                    {formatPrice(item.oneWay, currency.symbol)}
                  </td>
                )}
                {item.roundTrip !== undefined && (
                  <td
                    className="text-center"
                    style={{
                      border: '2.3px solid #87CEEB',
                      padding: '8px',
                      backgroundColor: '#2d4f4f',
                      color: 'white',
                    }}
                  >
                    {formatPrice(item.roundTrip, currency.symbol)}
                  </td>
                )}
                {item.hourly !== undefined && (
                  <td
                    className="text-center"
                    style={{
                      border: '2.3px solid #87CEEB',
                      padding: '8px',
                      backgroundColor: '#2d4f4f',
                      color: 'white',
                    }}
                  >
                    {formatPrice(item.hourly, currency.symbol)}
                  </td>
                )}
                {item.daily !== undefined && (
                  <td
                    className="text-center"
                    style={{
                      border: '2.3px solid #87CEEB',
                      padding: '8px',
                      backgroundColor: '#2d4f4f',
                      color: 'white',
                    }}
                  >
                    {formatPrice(item.daily, currency.symbol)}
                  </td>
                )}
                {item.monthly !== undefined && (
                  <td
                    className="text-center"
                    style={{
                      border: '2.3px solid #87CEEB',
                      padding: '8px',
                      backgroundColor: '#2d4f4f',
                      color: 'white',
                    }}
                  >
                    {formatPrice(item.monthly, currency.symbol)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PricingTable;
