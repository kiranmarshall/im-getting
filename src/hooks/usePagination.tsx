import { useMemo, useState } from 'react';

/* Types */

type PaginationItem = number | string;

/* Utility functions */

const calculatePaginationBar = (totalPages: number, currentIndex: number): PaginationItem[] => {
   if (!totalPages) return [];
   if (totalPages === 1) return [totalPages];
   return [0, '<', Math.floor(currentIndex / 10), '>', totalPages];
};

/* Hook */

export const usePagination = <T,>(arr: T[], desiredElements = 10) => {
   const [index, setIndex] = useState(0);

   const length = arr.length;
   const numberOfPages = Math.floor(length / desiredElements);

   const plusOne = () => setIndex((prevIndex) => (prevIndex < length - 9 ? prevIndex + 10 : prevIndex));
   const minusOne = () => setIndex((prevIndex) => (prevIndex > 9 ? prevIndex - 10 : prevIndex));

   const currentSlice = useMemo(() => arr.slice(index, index + 9), [index, arr]);

   const pagesToShow = calculatePaginationBar(numberOfPages, index);

   const handlePaginationClick = (item: PaginationItem) => {
      if (typeof item === 'string') return item === '<' ? minusOne() : plusOne();
      else setIndex(item);
   };

   return { currentSlice, pagesToShow, handlePaginationClick, index: index / 10 };
};

type Pagination = ReturnType<typeof usePagination>;

/* Component */

interface PaginationBarProps extends Pagination {
   className?: string;
}

export const PaginationBar = ({ className = '', handlePaginationClick, pagesToShow }: PaginationBarProps) => {
   return (
      <div className={`flex items-center space-x-4 text-lg ${className}`}>
         {pagesToShow.map((item, index) => (
            <button
               key={index}
               className="first:text-gray-700 text-gray-500 last:text-gray-700"
               onClick={() => handlePaginationClick(item)}
            >
               {typeof item === 'number' ? item + 1 : item}
            </button>
         ))}
      </div>
   );
};
