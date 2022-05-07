import { useState } from 'react';

/* Types */

export const errorTypes = {
   information: /^1[\d+]/,
   success: /^2[\d+]/,
   redirect: /^3[\d+]/,
   user: /^4[\d+]/,
   server: /^5[\d+]/,
};

type ErrorCode = { name: string; value: RegExp };

/* Utility functions */

export const codesMap: ErrorCode[] = Object.entries(errorTypes).map((error) => ({ name: error[0], value: error[1] }));
export const defaultCodes = [codesMap[3].value, codesMap[4].value];

/* Hook */

export const useStatusCodes = (statusCodes?: RegExp[]) => {
   const [codes, setCodes] = useState<RegExp[]>(statusCodes || defaultCodes);

   const handleCodeClick = (regex: RegExp) => {
      if (codes.includes(regex)) return setCodes(codes.filter((code) => code !== regex));

      if (regex === codesMap[1].value || regex === codesMap[2].value) {
         const confirmation = confirm('This may produce a lot of additional entries and take a while to render');
         if (!confirmation) return;
      }

      setCodes((prevcodes) => [...prevcodes, regex]);
   };

   return { codes, handleCodeClick };
};

type StatusCodes = ReturnType<typeof useStatusCodes>;

/* Component */

interface StatusCodesBarProps extends StatusCodes {
   className?: string;
}

export const StatusCodesBar = ({ className = '', codes, handleCodeClick }: StatusCodesBarProps) => {
   return (
      <div className={`flex items-center space-x-1 ${className}`}>
         {codesMap.map(({ name, value }, index) => {
            const selected = codes.includes(value);

            return (
               <button
                  key={name}
                  className={`text-gray-400 text-lg px-2 py-1 rounded-md ${selected ? 'bg-gray-300 !text-gray-600 ' : 'hover:bg-gray-200'}`}
                  onClick={() => handleCodeClick(value)}
               >
                  {`${index + 1}xx`}
               </button>
            );
         })}
      </div>
   );
};
