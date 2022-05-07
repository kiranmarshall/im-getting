import { uniqueId } from 'lodash';
import { ErrorPanel, UploadPanel } from './components';
import { MarkdownProvider, useErrors } from './contexts';
import './index.css';
import { PaginationBar, usePagination } from './hooks/usePagination';
import { useStatusCodes, defaultCodes, StatusCodesBar } from './hooks/useStatusCodes';

const App = () => {
   const { errors } = useErrors();

   const pagination = usePagination(errors);
   const statusCodes = useStatusCodes(defaultCodes);

   const bigRedClass = 'place-self-center text-7xl font-extrabold tracking-tighter text-red-500';

   return (
      <div className="flex flex-col space-y-4 p-10">
         <div className="flex items-center flex-wrap lg:max-w-[1400px]">
            <div className="flex flex-col space-y-2">
               <h1 className={bigRedClass}>I'm getting...</h1>
               <StatusCodesBar {...statusCodes} />
            </div>

            <UploadPanel {...statusCodes} />
         </div>

         <div className="flex items-center">
            {!!errors.length && <span className={`${bigRedClass} text-gray-600 text-4xl`}>Total: {errors.length}</span>}
            <PaginationBar {...pagination} className="ml-auto" />
         </div>

         {pagination.currentSlice.map((error) => (
            <MarkdownProvider key={uniqueId()}>
               <ErrorPanel {...error} />
            </MarkdownProvider>
         ))}
      </div>
   );
};

export default App;
