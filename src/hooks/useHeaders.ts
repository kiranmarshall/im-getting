import { useMemo, useState } from 'react';
import { Header } from 'har-format';

export function useHeaders(headers: Header[]): [Header[], Header[], (header: Header) => void, (header: Header) => void] {
   const [heads, setHeads] = useState<Header[]>([]);

   const headerTypes = useMemo(() => [...headers], [headers]);

   const headersToLog = headers.filter((head) => heads.includes(head) && head);

   const handleAdd = (header: Header) => {
      if (heads.includes(header)) return;
      return setHeads((h) => [...h, header]);
   };

   const handleRemove = (header: Header) =>
      setHeads((headers) => {
         return headers.filter((head) => head !== header);
      });

   return [headerTypes, headersToLog, handleAdd, handleRemove];
}
