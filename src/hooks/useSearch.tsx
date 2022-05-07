import { Dispatch, HTMLAttributes, SetStateAction, useEffect, useState } from 'react';
import { Entry, Request } from 'har-format';
import { useDebounce } from './useDebounce';

export function useSearch<R extends Request, K extends keyof R>(
   errors: Entry[],
   type?: K
): [Entry[], string, Dispatch<SetStateAction<string>>] {
   const [search, setSearch] = useState('');
   const debouncedSearch = useDebounce(search);

   const [searchResult, setSearchResult] = useState<Entry[]>(errors);

   useEffect(() => {
      setSearchResult(errors.filter(({ request }) => request.url.match(debouncedSearch)));
   }, [debouncedSearch, errors, type]);

   return [searchResult, search, setSearch];
}

interface FilterInputProps<T> extends HTMLAttributes<HTMLInputElement> {
   search: T;
   setSearch: (value: SetStateAction<T>) => void;
}

export const FilterInput = ({ search, setSearch }: FilterInputProps<string>) => {
   return (
      <input
         className="px-2 py-1"
         placeholder="Search by URL..."
         type="text"
         value={search}
         onChange={({ target }) => setSearch(target.value)}
      />
   );
};
