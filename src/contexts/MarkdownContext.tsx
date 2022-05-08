import { createContext, Dispatch, FC, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { isEqual, uniqWith } from 'lodash';
import { ObjectRecord } from '@/hooks';

interface MarkdownContext {
   setDefaultMarkdown: Dispatch<SetStateAction<Record<string, any>>>;
   setAllReqHeaders: Dispatch<SetStateAction<ObjectRecord[]>>;
   setAllResHeaders: Dispatch<SetStateAction<ObjectRecord[]>>;
   renderedMarkdown: string;
}

const Context = createContext({} as MarkdownContext);

export const MarkdownProvider: FC = (props) => {
   const [markdown, setMarkdown] = useState<ObjectRecord>({});
   const [defaultMarkdown, setDefaultMarkdown] = useState<ObjectRecord>({});

   const [allReqHeaders, setAllReqHeaders] = useState<ObjectRecord[]>([]);
   const [allResHeaders, setAllResHeaders] = useState<ObjectRecord[]>([]);

   useEffect(() => {
      setMarkdown(() => Object.assign({}, defaultMarkdown, ...allReqHeaders, ...allResHeaders));
   }, [allReqHeaders, allResHeaders]);

   const renderedMarkdown = useMemo(() => renderMarkdown(markdown), [markdown]);

   const ctx = { setDefaultMarkdown, renderedMarkdown, setAllResHeaders, setAllReqHeaders };

   return <Context.Provider value={ctx} {...props} />;
};

export const useMarkdown = () => useContext(Context);

export const renderMarkdown = (markdown: ObjectRecord) => {
   const arr = Object.entries(markdown);
   return arr.map((item) => `*${item[0]}*: \`\`\`${item[1]}\`\`\`  `).join('');
};
