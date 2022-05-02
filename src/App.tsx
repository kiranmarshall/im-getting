import { useState } from 'react';
import { ErrorPanel, errorTypes, UploadPanel } from './components';
import { MarkdownProvider, useErrors } from './contexts';
import './index.css';
import { uniqueId } from 'lodash';

const codesMap = Object.entries(errorTypes).map((error) => ({ name: error[0], value: error[1] }));
const defaultCodes = [codesMap[3].value, codesMap[4].value];

const App = () => {
   const { errors } = useErrors();
   const [codes, setCodes] = useState<RegExp[]>(defaultCodes);

   const bigRedClass = 'place-self-center text-7xl font-extrabold tracking-tighter text-red-500';

   const handleCodeClick = (regex: RegExp) => {
      if (codes.includes(regex)) return setCodes(codes.filter((code) => code !== regex));

      if (regex === codesMap[1].value || regex === codesMap[2].value) {
         const confirmation = confirm('This may produce a lot of additional entries and take a while to render');
         if (!confirmation) return;
      }

      setCodes((prevcodes) => [...prevcodes, regex]);
   };

   return (
      <div className="flex flex-col space-y-4 p-10">
         <div className="flex items-center flex-wrap lg:max-w-[1400px]">
            <div className="flex flex-col space-y-2">
               <h1 className={bigRedClass}>I'm getting...</h1>
               <div className="flex items-center space-x-2">
                  {codesMap.map(({ name, value }, index) => {
                     const selected = codes.includes(value);

                     return (
                        <button
                           key={name}
                           className={`text-gray-400 text-lg ${selected ? 'underline !text-gray-600' : ''}`}
                           onClick={() => handleCodeClick(value)}
                        >
                           {`${index + 1}xx`}
                        </button>
                     );
                  })}
               </div>
            </div>

            <UploadPanel codes={codes} />
         </div>

         {!!errors.length && <span className={`${bigRedClass} text-gray-600 text-4xl`}>Total: {errors.length}</span>}

         {errors.map((error) => (
            <MarkdownProvider key={uniqueId()}>
               <ErrorPanel {...error} />
            </MarkdownProvider>
         ))}
      </div>
   );
};

export default App;
