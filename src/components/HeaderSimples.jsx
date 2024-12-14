import Link from 'next/link';

export default function HeaderSimples() {
  return (
    <header className="bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="w-full mx-auto">
          <div className="flex justify-center items-center h-16 md:h-20">
            <Link href="/" className="flex items-center pointer-events-none">
              <span className="text-white text-2xl font-bold">GARAGE</span>
              <span className="text-orange-500 text-2xl font-bold">16</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
} 