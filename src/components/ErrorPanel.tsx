import { BaseSyntheticEvent, FC, useEffect, useState } from 'react';
import { Entry, Request, Response } from 'har-format';
import { useHeaders } from '@/hooks';
import { useErrors, useMarkdown } from '@/contexts';

enum HTTPMethods {
   GET = 'GET',
   DELETE = 'DELETE',
   OPTIONS = 'OPTIONS',
   POST = 'POST',
   PUT = 'PUT',
}

export const ErrorPanel = (error: Entry) => {
   const { request, response } = error;

   const { removeError } = useErrors();
   const { setDefaultMarkdown, renderedMarkdown } = useMarkdown();

   const requestPayload = request.postData ? { reqPayload: request.postData.text } : {};

   useEffect(() => {
      setDefaultMarkdown({ method: request.method, url: request.url, status: response.status, ...requestPayload });
   }, [error]);

   return (
      <div className="bg-gray-200 rounded-md px-4 py-2 ">
         <div className=" flex">
            <div className=" pt-2 mx-4 flex flex-col space-y-2 ">
               <button className="" onClick={() => removeError(error)}>
                  ❌
               </button>
               <button onClick={() => navigator.clipboard.writeText(renderedMarkdown)}>🗒️</button>
            </div>

            <div className=" flex-grow flex flex-col ">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <RequestPanel data={request} />
                  <ResponsePanel data={response} />
               </div>
            </div>
         </div>
      </div>
   );
};

const RequestPanel = ({ data }: { data: Request }) => {
   const { headers, method, url, postData, cookies: cooks } = data;

   const [heads, headsToLog, handleAdd, handleRemove, transformedHeads] = useHeaders(headers);
   const [cookies, cookiesToLog, handleAddCookies, handleRemoveCookies, transformedCookies] = useHeaders(cooks);

   const [expanded, setExpanded] = useState(false);
   const [cookiesExpanded, setCookiesExpanded] = useState(false);

   const { addHeaderToMarkdown } = useMarkdown();

   useEffect(() => {
      addHeaderToMarkdown([transformedHeads, transformedCookies]);
   }, [transformedHeads, transformedCookies]);

   return (
      <PanelContainer>
         <div className="w-full flex items-center">
            <PanelHead>Request</PanelHead>
            <AddButton expanded={expanded} onClick={() => setExpanded((e) => !e)} type="headers" />
            <AddButton expanded={cookiesExpanded} onClick={() => setCookiesExpanded((e) => !e)} type="cookies" />
         </div>

         <Method method={method} />
         <Url url={url} />
         {headsToLog.map((header, index) => (
            <AddedHeader key={`${header.name}${index}`} name={header.name} value={header.value} onClick={() => handleRemove(header)} />
         ))}
         {cookiesToLog.map((header, index) => (
            <AddedHeader
               key={`${header.name}${index}`}
               name={header.name}
               value={header.value}
               onClick={() => handleRemoveCookies(header)}
            />
         ))}

         {cookiesExpanded && (
            <PanelList>
               {cookies.map((header, index) => {
                  const exists = cookiesToLog.includes(header);

                  return (
                     !exists && (
                        <HeaderToAdd
                           picked={false}
                           key={`${header.name}${index}`}
                           header={header.name}
                           onClick={() => handleAddCookies(header)}
                        />
                     )
                  );
               })}
            </PanelList>
         )}

         {expanded && (
            <PanelList>
               {heads.map((header, index) => {
                  const exists = headsToLog.includes(header);

                  return (
                     !exists && (
                        <HeaderToAdd picked={false} key={`${header.name}${index}`} header={header.name} onClick={() => handleAdd(header)} />
                     )
                  );
               })}
            </PanelList>
         )}

         {postData && (
            <div className="flex items-start ">
               <span className=" min-w-fit mr-2">payload: </span>
               <span className="max-h-8 overflow-hidden">{postData.text}</span>
            </div>
         )}
      </PanelContainer>
   );
};

const ResponsePanel = ({ data }: { data: Response }) => {
   const { headers, status, content } = data;
   const [heads, headsToLog, handleAdd, handleRemove, transformedHeads] = useHeaders(headers);

   const [expanded, setExpanded] = useState(false);

   const { addHeaderToMarkdown } = useMarkdown();

   useEffect(() => {
      addHeaderToMarkdown([transformedHeads]);
   }, [transformedHeads]);

   return (
      <PanelContainer>
         <div className="w-full flex items-center">
            <PanelHead>Response</PanelHead>
            <AddButton expanded={expanded} onClick={() => setExpanded((e) => !e)} type="headers" />
         </div>

         <span>status: {status}</span>
         {headsToLog.map((header, index) => (
            <AddedHeader key={`${header.name}${index}`} name={header.name} value={header.value} onClick={() => handleRemove(header)} />
         ))}

         {expanded && (
            <PanelList>
               {heads.map((header, index) => {
                  const exists = headsToLog.includes(header);

                  return (
                     !exists && (
                        <HeaderToAdd picked={false} key={`${header.name}${index}`} header={header.name} onClick={() => handleAdd(header)} />
                     )
                  );
               })}
            </PanelList>
         )}

         {content && (
            <div className="flex items-start ">
               <span className=" min-w-fit mr-2">payload: </span>
               <span className="max-h-8 overflow-hidden">{content?.text}</span>
            </div>
         )}
      </PanelContainer>
   );
};

const AddedHeader = ({ name, value, onClick }: { name: string; value: string; onClick: () => void }) => {
   return (
      <button onClick={onClick} className="overflow-hidden flex items-center">
         <span className="whitespace-nowrap px-1 py-1 bg-gray-100 rounded-sm mr-1">{name}: </span>
         <span className="text-left">{value}</span>
      </button>
   );
};

const HeaderToAdd = ({ header, onClick, picked }: { header: string; onClick: (e: BaseSyntheticEvent) => void; picked: boolean }) => (
   <button className={`whitespace-nowrap pl-1 pr-2 py-1 bg-gray-200 rounded-sm m-1 ${picked ? 'opacity-10' : ''}`} onClick={onClick}>
      {header}
   </button>
);

const PanelContainer: FC = (props) => <div className="flex flex-col space-y-2 p-2 items-start line-wrap bg-white rounded-md" {...props} />;
const PanelHead: FC = (props) => <h1 className=" font-sans font-semibold text-xl" {...props} />;
const PanelList: FC = (props) => <ul className="flex flex-wrap bg-gray-50 p-1 rounded-md" {...props} />;

const Method = ({ method }: { method: string }) => {
   const { DELETE, GET, OPTIONS, POST, PUT } = HTTPMethods;

   const bgColorResolver = (type: string) => {
      if (type === DELETE) return 'bg-red-200';
      if (type === GET) return 'bg-blue-200';
      if (type === OPTIONS) return 'bg-yellow-200';
      if (type === POST) return 'bg-purple-200';
      if (type === PUT) return 'bg-orange-200';
   };

   return (
      <div className="whitespace-nowrap">
         <span className={`mr-2`}>method:</span>
         <span className={`px-1 py-1 rounded-sm ${bgColorResolver(method)}`}>{method}</span>
      </div>
   );
};

const Url = ({ url }: { url: string }) => (
   <div className="flex items-start ">
      <span className=" min-w-fit mr-2">url: </span>
      <span className="max-h-8 overflow-hidden">{url}</span>
   </div>
);

interface AddButtonProps {
   onClick: () => void;
   expanded: boolean;
   type: string;
}

const AddButton: FC<AddButtonProps> = ({ onClick, expanded, type }) => (
   <button
      className={`ml-auto font-sans rounded-md text-xs px-2 py-1 transition-colors capitalize ${
         expanded ? 'bg-green-100' : 'bg-green-200'
      }`}
      onClick={onClick}
   >
      {`All ${type}`}
   </button>
);
