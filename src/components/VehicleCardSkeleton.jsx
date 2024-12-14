import Skeleton from './ui/Skeleton';

export default function VehicleCardSkeleton() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-800/50">
      {/* Imagem */}
      <Skeleton className="absolute inset-0" />
      
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>

      {/* Informações */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
} 