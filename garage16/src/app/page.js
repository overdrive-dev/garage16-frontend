import Image from "next/image";
import Link from "next/link";
import { motos } from "@/data/motos";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Grid de motos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {motos.map((moto) => (
          <Link href={`/veiculo/${moto.id}`} key={moto.id} className="block">
            <div className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#FD4308] transition-all">
              <div className="relative h-48">
                <Image
                  src={moto.imagens[0]}
                  alt={moto.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{moto.titulo}</h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <p>Ano: {moto.ano}</p>
                  <p>KM: {moto.km}</p>
                  <p>Cor: {moto.cor}</p>
                  <p className="text-[#FD4308] font-semibold">{moto.preco}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
