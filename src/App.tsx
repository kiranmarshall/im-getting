import { uniqueId } from 'lodash';
import { ErrorPanel, UploadPanel } from './components';
import { MarkdownProvider, useErrors } from './contexts';
import './index.css';
import { PaginationBar, usePagination } from './hooks/usePagination';
import { useStatusCodes, StatusCodesBar } from './hooks/useStatusCodes';
import { FilterInput, useSearch } from './hooks';

const App = () => {
   const { errors } = useErrors();
   const [searchResult, search, setSearch] = useSearch(errors, 'url');

   const pagination = usePagination(searchResult);
   const { currentSlice } = pagination;

   const statusCodes = useStatusCodes();

   const bigRedClass = 'place-self-center text-7xl font-extrabold tracking-tighter text-red-500';

   return (
      <div className="flex flex-col space-y-4 p-10">
         <div className="flex items-center flex-wrap lg:max-w-[1400px] mb-4">
            <div className="flex flex-col">
               <h1 className={bigRedClass}>I'm getting...</h1>
               <StatusCodesBar {...statusCodes} className="mt-2 mb-4" />
               <FilterInput search={search} setSearch={setSearch} />
            </div>

            <UploadPanel {...statusCodes} />
         </div>

         <div className="flex items-center">
            {!!currentSlice.length && (
               <span className={`${bigRedClass} text-gray-600 text-4xl`}>
                  Viewing {currentSlice.length} of {errors.length}
               </span>
            )}

            {!currentSlice.length && <span className={`${bigRedClass} text-gray-600 text-4xl`}>No items to display</span>}

            <PaginationBar {...pagination} className="ml-auto" />
         </div>

         {currentSlice.map((error) => (
            <MarkdownProvider key={uniqueId()}>
               <ErrorPanel {...error} />
            </MarkdownProvider>
         ))}
      </div>
   );
};

export default App;
