export default function LoadingComponent() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <div className="text-gray-300">Carregando...</div>
      </div>
    </main>
  );
} 