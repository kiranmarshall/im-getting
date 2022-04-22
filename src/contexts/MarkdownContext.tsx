import { createContext, FC, useContext, useState } from 'react';

interface MarkdownContext {
   markdown: Record<string, any>;
   setMarkdown: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const Context = createContext({} as MarkdownContext);

export const MarkdownProvider: FC = (props) => {
   const [markdown, setMarkdown] = useState<Record<string, any>>({});

   return <Context.Provider value={{ markdown, setMarkdown }} {...props} />;
};

export const useMarkdown = () => useContext(Context);
