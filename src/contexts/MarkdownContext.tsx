import { createContext, Dispatch, FC, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { isEqual, uniqWith } from 'lodash';
import { ObjectRecord } from '@/hooks';

interface MarkdownContext {
   markdown: Record<string, any>;
   setMarkdown: Dispatch<SetStateAction<Record<string, any>>>;
   setDefaultMarkdown: Dispatch<SetStateAction<Record<string, any>>>;
   setAllReqHeaders: Dispatch<SetStateAction<ObjectRecord[]>>;
   setAllResHeaders: Dispatch<SetStateAction<ObjectRecord[]>>;
   // addHeaderToMarkdown: (headers: ObjectRecord[][]) => void;
   addHeaderToMarkdown: (headers: ObjectRecord[]) => void;
   renderedMarkdown: string;
}

const Context = createContext({} as MarkdownContext);

export const MarkdownProvider: FC = (props) => {
   const [markdown, setMarkdown] = useState<ObjectRecord>({});
   const [defaultMarkdown, setDefaultMarkdown] = useState<ObjectRecord>({});
   const [headersToAdd, setHeadersToAdd] = useState<ObjectRecord[]>([]);

   const [allReqHeaders, setAllReqHeaders] = useState<ObjectRecord[]>([]);
   const [allResHeaders, setAllResHeaders] = useState<ObjectRecord[]>([]);

   console.log({ allReqHeaders, allResHeaders });

   const addHeaderToMarkdown = (headers: ObjectRecord[]) => {
      // const flattenedHeads = headers.flatMap((h) => h);

      // return setHeadersToAdd((prevHeaders) => {
      //    const unique = uniqWith([...flattenedHeads], isEqual);
      //    return unique;
      // });

      return null;
   };

   useEffect(() => {
      setHeadersToAdd([...allReqHeaders, ...allResHeaders]);
   }, [allReqHeaders, allResHeaders]);

   useEffect(() => {
      setMarkdown(() => Object.assign({}, defaultMarkdown, ...headersToAdd));
   }, [headersToAdd]);

   const renderedMarkdown = useMemo(() => renderMarkdown(markdown), [markdown]);

   const ctx = { markdown, setMarkdown, setDefaultMarkdown, addHeaderToMarkdown, renderedMarkdown, setAllResHeaders, setAllReqHeaders };

   return <Context.Provider value={ctx} {...props} />;
};

export const useMarkdown = () => useContext(Context);

export const renderMarkdown = (markdown: ObjectRecord) => {
   const arr = Object.entries(markdown);
   return arr.map((item) => `*${item[0]}*: \`\`\`${item[1]}\`\`\`  `).join('');
};
