import { BaseSyntheticEvent, FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Entry, Request, Response } from 'har-format';
import { errorTypes, useHeaders } from '@/hooks';
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
   const responsePayload = response.content.text ? { resPayload: response.content.text } : {};

   useEffect(() => {
      setDefaultMarkdown({ method: request.method, url: request.url, status: response.status, ...requestPayload, ...responsePayload });
   }, [error]);

   return (
      <div className="px-4 py-2 bg-gray-200 rounded-md ">
         <div className="flex ">
            <div className="flex flex-col pt-2 mx-4 mr-6 space-y-2 ">
               <WithToolTip label="remove">
                  <ActionButton onClick={() => removeError(error)}>❌</ActionButton>
               </WithToolTip>

               <WithToolTip label="Copy markdown to clipboard">
                  <ActionButton onClick={() => navigator.clipboard.writeText(renderedMarkdown)}>🗒️</ActionButton>
               </WithToolTip>
            </div>

            <div className="flex flex-col flex-grow ">
               <div className="grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2">
                  <RequestPanel data={request} />
                  <ResponsePanel data={response} />
               </div>
            </div>
         </div>
      </div>
   );
};

const ActionButton: FC<HTMLAttributes<HTMLButtonElement>> = (props) => {
   return <button className="text-xl transition-transform duration-100 hover:scale-110" {...props} />;
};

const WithToolTip: FC<{ label: string }> = ({ children, label }) => {
   const [shown, setShown] = useState(false);

   return (
      <div onMouseEnter={() => setShown(true)} onMouseLeave={() => setShown(false)}>
         <div className="absolute">
            {shown && (
               <span className="relative px-2 py-1 text-xs uppercase bg-gray-700 rounded-md text-gray-50 whitespace-nowrap bottom-6">
                  {label}
               </span>
            )}
         </div>

         {children}
      </div>
   );
};

const RequestPanel = ({ data }: { data: Request }) => {
   const { headers, method, url, postData, cookies: cooks } = data;

   const [heads, headsToLog, handleAdd, handleRemove, transformedHeads] = useHeaders(headers);
   const [cookies, cookiesToLog, handleAddCookies, handleRemoveCookies, transformedCookies] = useHeaders(cooks);

   const [expanded, setExpanded] = useState(false);
   const [cookiesExpanded, setCookiesExpanded] = useState(false);

   const { setAllReqHeaders } = useMarkdown();

   useEffect(() => {
      setAllReqHeaders([...transformedHeads, ...transformedCookies]);
   }, [transformedHeads, transformedCookies]);

   return (
      <PanelContainer>
         <div className="flex items-center w-full">
            <PanelHead>Request</PanelHead>

            <div className="items-center ml-auto space-x-4 felx">
               <AddButton expanded={expanded} onClick={() => setExpanded((e) => !e)} type="headers" disabled={!heads.length} />
               <AddButton
                  expanded={cookiesExpanded}
                  onClick={() => setCookiesExpanded((e) => !e)}
                  type="cookies"
                  disabled={!cookies.length}
               />
            </div>
         </div>

         <Method method={method} />
         <Url url={url} />

         <div className="overflow-hidden grid grid-cols-[auto,1fr] pr-2 ">
            <span className="mr-2 min-w-fit">payload: </span>
            <span className="max-w-full truncate">{postData?.text ?? 'No Payload'}</span>
         </div>

         {!!headsToLog.length && (
            <div className="w-full px-1 py-2 border">
               <p className="mb-2 font-medium">Added Headers</p>
               <div className="space-y-1 flex-flex-col">
                  {headsToLog.map((header, index) => (
                     <AddedHeader
                        key={`${header.name}${index}`}
                        name={header.name}
                        value={header.value}
                        onClick={() => handleRemove(header)}
                     />
                  ))}
               </div>
            </div>
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

         {!!cookiesToLog.length && (
            <div className="w-full px-1 py-2 border">
               <p className="mb-2 font-medium">Added Cookies</p>
               <div className="space-y-1 flex-flex-col">
                  {cookiesToLog.map((header, index) => (
                     <AddedHeader
                        key={`${header.name}${index}`}
                        name={header.name}
                        value={header.value}
                        onClick={() => handleRemoveCookies(header)}
                     />
                  ))}
               </div>
            </div>
         )}

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
      </PanelContainer>
   );
};

const ResponsePanel = ({ data }: { data: Response }) => {
   const { headers, status, content, cookies: cooks } = data;

   const [heads, headsToLog, handleAdd, handleRemove, transformedHeads] = useHeaders(headers);
   const [cookies, cookiesToLog, handleAddCookies, handleRemoveCookies, transformedCookies] = useHeaders(cooks);

   const [expanded, setExpanded] = useState(false);
   const [cookiesExpanded, setCookiesExpanded] = useState(false);

   const { setAllResHeaders } = useMarkdown();

   useEffect(() => {
      setAllResHeaders([...transformedHeads, ...transformedCookies]);
   }, [transformedHeads, transformedCookies]);

   return (
      <PanelContainer>
         <div className="flex items-center w-full">
            <PanelHead>Response</PanelHead>

            <div className="items-center ml-auto space-x-4 felx">
               <AddButton expanded={expanded} onClick={() => setExpanded((e) => !e)} type="headers" disabled={!heads.length} />
               <AddButton
                  expanded={cookiesExpanded}
                  onClick={() => setCookiesExpanded((e) => !e)}
                  type="cookies"
                  disabled={!cookies.length}
               />
            </div>
         </div>

         {status && <Status status={status.toString()} />}

         <div className="overflow-hidden grid grid-cols-[auto,1fr] pr-2 ">
            <span className="mr-2 min-w-fit">payload: </span>
            <span className="max-w-full truncate">{content.text ?? 'No Payload'}</span>
         </div>

         {!!headsToLog.length && (
            <div className="w-full px-1 py-2 border">
               <p className="mb-2 font-medium">Added Headers</p>
               <div className="space-y-1 flex-flex-col">
                  {headsToLog.map((header, index) => (
                     <AddedHeader
                        key={`${header.name}${index}`}
                        name={header.name}
                        value={header.value}
                        onClick={() => handleRemove(header)}
                     />
                  ))}
               </div>
            </div>
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

         {!!cookiesToLog.length && (
            <div className="w-full px-1 py-2 border">
               <p className="mb-2 font-medium">Added Cookies</p>
               <div className="space-y-1 flex-flex-col">
                  {cookiesToLog.map((header, index) => (
                     <AddedHeader
                        key={`${header.name}${index}`}
                        name={header.name}
                        value={header.value}
                        onClick={() => handleRemoveCookies(header)}
                     />
                  ))}
               </div>
            </div>
         )}

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
      </PanelContainer>
   );
};

const AddedHeader = ({ name, value, onClick }: { name: string; value: string; onClick: () => void }) => {
   return (
      <div className="overflow-hidden grid grid-cols-[auto,1fr]">
         <button onClick={onClick} className="px-1 py-1 mr-1 bg-gray-100 rounded-sm whitespace-nowrap place-self-center">
            {name}:{' '}
         </button>
         <span className="self-center max-w-full text-left truncate">{value}</span>
      </div>
   );
};

const HeaderToAdd = ({ header, onClick, picked }: { header: string; onClick: (e: BaseSyntheticEvent) => void; picked: boolean }) => (
   <button className={`whitespace-nowrap pl-1 pr-2 py-1 bg-gray-200 rounded-sm m-1 ${picked ? 'opacity-10' : ''}`} onClick={onClick}>
      {header}
   </button>
);

const PanelContainer: FC = (props) => <div className="flex flex-col items-start p-2 space-y-2 bg-white rounded-md line-wrap" {...props} />;
const PanelHead: FC = (props) => <h1 className="font-sans text-xl font-semibold " {...props} />;
const PanelList: FC = (props) => <ul className="flex flex-wrap p-1 rounded-md bg-gray-50" {...props} />;

const methodBgColorResolver = (type: string) => {
   const { DELETE, GET, OPTIONS, POST, PUT } = HTTPMethods;

   if (type === DELETE) return 'bg-red-200';
   if (type === GET) return 'bg-blue-200';
   if (type === OPTIONS) return 'bg-yellow-200';
   if (type === POST) return 'bg-purple-200';
   if (type === PUT) return 'bg-orange-200';
};

const statusBgColorResolver = (type: string) => {
   const { success, redirect, information, server, user } = errorTypes;

   if (success.test(type)) return 'bg-green-600';
   if (redirect.test(type)) return 'bg-pink-600';
   if (information.test(type)) return 'bg-blue-600';
   if (server.test(type)) return 'bg-red-600';
   if (user.test(type)) return 'bg-orange-600';
};

const Status = ({ status }: { status: string }) => {
   return (
      <div className="overflow-hidden grid grid-cols-[auto,1fr] pr-2 ">
         <span className="mr-2 place-self-center">status:</span>
         <span className={`px-1 py-1 rounded-sm text-white ${statusBgColorResolver(status)}`}>{status}</span>
      </div>
   );
};

const Method = ({ method }: { method: string }) => {
   return (
      <div className="overflow-hidden grid grid-cols-[auto,1fr] pr-2 ">
         <span className="mr-2 place-self-center">method:</span>
         <span className={`px-1 py-1 rounded-sm ${methodBgColorResolver(method)}`}>{method}</span>
      </div>
   );
};

const Url = ({ url }: { url: string }) => (
   <div className="overflow-hidden grid grid-cols-[auto,1fr] pr-2">
      <span className="mr-2 min-w-fit">url: </span>
      <span className="max-w-full truncate">{url}</span>
   </div>
);

interface AddButtonProps extends HTMLAttributes<HTMLButtonElement> {
   onClick: () => void;
   expanded: boolean;
   type: 'headers' | 'cookies';
   disabled: boolean;
}

const AddButton = ({ onClick, expanded, type, disabled }: AddButtonProps) => {
   const baseClass = 'font-sans rounded-md text-xs px-2 py-1 transition-colors capitalize disabled:bg-red-50';

   return (
      <button onClick={onClick} disabled={disabled} className={`${baseClass} ${expanded ? 'bg-green-100' : 'bg-green-200'} `}>
         {`${disabled ? 'No' : 'All'} ${type}`}
      </button>
   );
};
