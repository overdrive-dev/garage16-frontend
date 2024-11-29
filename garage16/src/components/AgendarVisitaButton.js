'use client';

import Link from 'next/link';

export default function AgendarVisitaButton({ motoId }) {
  return (
    <Link
      href={`/veiculo/${motoId}/agendar`}
      className="block w-full bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-4 px-8 rounded-lg transition-colors text-center"
    >
      Agendar Visita
    </Link>
  );
} 