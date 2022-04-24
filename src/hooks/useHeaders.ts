import { useMemo, useState } from 'react';
import { Header } from 'har-format';

export type ObjectRecord = Record<string, any>;

export function useHeaders(headers: Header[]): [Header[], Header[], (header: Header) => void, (header: Header) => void, ObjectRecord[]] {
   const [headsToLog, setHeadsToLog] = useState<Header[]>([]);

   const headerTypes = useMemo(() => [...headers], [headers]);
   const transformedHeaders = useMemo(() => headsToLog.map(objectTransformer), [headsToLog]);

   const handleAdd = (header: Header) => {
      if (headsToLog.includes(header)) return;
      return setHeadsToLog((h) => [...h, header]);
   };

   const handleRemove = (header: Header) =>
      setHeadsToLog((headers) => {
         return headers.filter((head) => head !== header);
      });

   return [headerTypes, headsToLog, handleAdd, handleRemove, transformedHeaders];
}

const objectTransformer = (obj: ObjectRecord): ObjectRecord => {
   const transformedObject = Object.values(obj);
   return Object.fromEntries([transformedObject]);
};
