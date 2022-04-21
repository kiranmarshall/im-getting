import { BaseSyntheticEvent, useMemo, useState } from 'react';
import { Header } from 'har-format';

export function useHeaders(headers: Header[]): [Header[], Header[], (e: BaseSyntheticEvent) => void, (name: string) => void] {
   const [heads, setHeads] = useState<string[]>([]);

   const headerTypes = useMemo(() => [...headers], [headers]);

   const headersToLog = headers.filter(({ name, value }) => heads.includes(name) && { name, value });

   const handleAdd = (e: BaseSyntheticEvent) => {
      const header = e.target.innerHTML;

      if (heads.includes(header)) return;
      return setHeads((h) => [...h, header]);
   };

   const handleRemove = (name: string) =>
      setHeads((headers) => {
         return headers.filter((header) => header !== name);
      });

   return [headerTypes, headersToLog, handleAdd, handleRemove];
}
