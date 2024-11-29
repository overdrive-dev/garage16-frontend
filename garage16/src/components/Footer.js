export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#FD4308] font-bold text-lg mb-4">Garage16</h3>
            <p className="text-gray-400">
              Sua loja especializada em motos premium
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <p className="text-gray-400">Tel: (11) 99999-9999</p>
            <p className="text-gray-400">Email: contato@garage16.com.br</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Endereço</h4>
            <p className="text-gray-400">
              Rua das Motos, 123
              <br />
              São Paulo - SP
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 