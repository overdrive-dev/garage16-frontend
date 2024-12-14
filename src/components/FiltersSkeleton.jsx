import Skeleton from './ui/Skeleton';

export default function FiltersSkeleton() {
  return (
    <div className="w-64 flex-shrink-0 space-y-6">
      {/* Filtros Salvos Skeleton */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <Skeleton className="h-5 w-24" /> {/* Título */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Filtros Atuais Skeleton */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-6">
        {/* Marca */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-12" /> {/* Label */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" /> {/* Input Min */}
            <Skeleton className="h-10 w-full" /> {/* Input Max */}
          </div>
        </div>

        {/* Preço */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" /> {/* Label */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" /> {/* Input Min */}
            <Skeleton className="h-10 w-full" /> {/* Input Max */}
          </div>
        </div>
      </div>
    </div>
  );
} 