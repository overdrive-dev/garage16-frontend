'use client'

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Breadcrumb({ items }) {
  return (
    <div className="flex items-center p-6 text-sm">
      {items.map((item, index) => (
        <div key={item.href || index} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-600" />
          )}
          
          {item.href ? (
            <Link 
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-300">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
} 