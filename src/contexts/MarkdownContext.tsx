import { createContext, FC, useContext, useEffect, useMemo, useState } from 'react';
import { isEqual, uniqWith } from 'lodash';
import { ObjectRecord } from '@/hooks';

interface MarkdownContext {
   markdown: Record<string, any>;
   setMarkdown: React.Dispatch<React.SetStateAction<Record<string, any>>>;
   setDefaultMarkdown: React.Dispatch<React.SetStateAction<Record<string, any>>>;
   addHeaderToMarkdown: (headers: ObjectRecord[][]) => void;
   renderedMarkdown: string;
}

const Context = createContext({} as MarkdownContext);

export const MarkdownProvider: FC = (props) => {
   const [markdown, setMarkdown] = useState<ObjectRecord>({});
   const [defaultMarkdown, setDefaultMarkdown] = useState<ObjectRecord>({});
   const [headersToAdd, setHeadersToAdd] = useState<ObjectRecord[]>([]);

   const addHeaderToMarkdown = (headers: ObjectRecord[]) => {
      const flattenedHeads = headers.flatMap((h) => h);

      return setHeadersToAdd((prevHeaders) => {
         const unique = uniqWith([...prevHeaders, ...flattenedHeads], isEqual);
         return unique;
      });
   };

   useEffect(() => {
      setMarkdown(() => Object.assign({}, defaultMarkdown, ...headersToAdd));
   }, [headersToAdd]);

   const renderedMarkdown = useMemo(() => renderMarkdown(markdown), [markdown]);

   const ctx = { markdown, setMarkdown, setDefaultMarkdown, addHeaderToMarkdown, renderedMarkdown };

   return <Context.Provider value={ctx} {...props} />;
};

export const useMarkdown = () => useContext(Context);

export const renderMarkdown = (markdown: ObjectRecord) => {
   const arr = Object.entries(markdown);
   return arr.map((item) => `*${item[0]}*: \`\`\`${item[1]}\`\`\`  `).join('');
};
