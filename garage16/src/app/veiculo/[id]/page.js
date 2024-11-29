import Image from "next/image";
import { getMotoById } from "@/data/motos";
import { notFound } from "next/navigation";
import AgendarVisitaButton from "@/components/AgendarVisitaButton";
import { getCloudinaryUrl } from '@/utils/cloudinary';

// Marcar a função como assíncrona
async function getData(id) {
  const moto = getMotoById(id);
  if (!moto) {
    notFound();
  }
  return moto;
}

export default async function VeiculoDetalhes({ params }) {
  const moto = await getData(params.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Slider de imagens */}
      <div className="w-full h-[500px] bg-gray-800 rounded-lg mb-8 relative">
        <Image
          src={getCloudinaryUrl(moto.imagens[0], { width: 1200, height: 800 })}
          alt={moto.titulo}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      <h1 className="text-3xl font-bold mb-4">{moto.titulo}</h1>
      <p className="text-2xl text-[#FD4308] font-bold mb-4">{moto.preco}</p>
      
      <div className="bg-gray-800 rounded p-4 mb-8 text-sm">
        <p>Anúncio autorizado em: {moto.dataAutorizacao}</p>
        <p>Autorizado por: {moto.autorizadoPor}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Descrição</h2>
        <p className="text-gray-400">{moto.descricao}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ficha Técnica</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(moto.fichaTecnica).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-400 mb-1 capitalize">{key}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <AgendarVisitaButton motoId={moto.id} moto={moto} />
    </div>
  );
} 