import Image from 'next/image';
import Link from 'next/link';

export default function VehicleCard({ vehicle }) {
  return (
    <Link href={`/veiculo/${vehicle.id}`}>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-orange-500 transition-colors">
        <div className="relative h-48">
          <Image
            src={vehicle.imageUrl}
            alt={vehicle.modelo}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-100">{vehicle.modelo}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-gray-400">{vehicle.anoModelo}</p>
            <p className="text-gray-400">{vehicle.kilometragem} km</p>
            <p className="text-xl font-bold text-orange-500">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(vehicle.preco)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
} 