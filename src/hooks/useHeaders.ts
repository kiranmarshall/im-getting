import { BaseSyntheticEvent, useState } from 'react';
import { Header } from 'har-format';

export function useHeaders(headers: Header[]): [string[], Header[], (e: BaseSyntheticEvent) => void, (name: string) => void] {
   const [heads, setHeads] = useState<string[]>([]);

   const headerTypes = headers.map(({ name }) => name);

   const headersToLog = headers.filter(({ name, value }) => {
      return heads.includes(name) && { name, value };
   });

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
