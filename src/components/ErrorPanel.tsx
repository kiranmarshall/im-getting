import { BaseSyntheticEvent, FC, HTMLAttributes, useEffect, useState } from 'react';
import { Entry, Request, Response } from 'har-format';
import { errorTypes, ObjectRecord, useHeaders } from '@/hooks';
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

   const { setAllReqHeaders } = useMarkdown();

   useEffect(() => {
      setAllReqHeaders([...transformedHeads, ...transformedCookies]);
   }, [transformedHeads, transformedCookies]);

   return (
      <PanelContainer>
         <div className="w-full flex items-center">
            <PanelHead>Request</PanelHead>

            <div className="ml-auto felx items-center space-x-4">
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
            <span className="min-w-fit mr-2">payload: </span>
            <span className="max-w-full truncate">{postData?.text ?? 'No Payload'}</span>
         </div>

         {!!headsToLog.length && (
            <div className="border w-full py-2 px-1">
               <p className="font-medium mb-2">Added Headers</p>
               <div className="flex-flex-col space-y-1">
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
            <div className="border w-full py-2 px-1">
               <p className="font-medium mb-2">Added Cookies</p>
               <div className="flex-flex-col space-y-1">
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
         <div className="w-full flex items-center">
            <PanelHead>Response</PanelHead>

            <div className="ml-auto felx items-center space-x-4">
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
            <span className=" min-w-fit mr-2">payload: </span>
            <span className="max-w-full truncate">{content.text ?? 'No Payload'}</span>
         </div>

         {!!headsToLog.length && (
            <div className="border w-full py-2 px-1">
               <p className="font-medium mb-2">Added Headers</p>
               <div className="flex-flex-col space-y-1">
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
            <div className="border w-full py-2 px-1">
               <p className="font-medium mb-2">Added Cookies</p>
               <div className="flex-flex-col space-y-1">
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
         <button onClick={onClick} className="whitespace-nowrap place-self-center px-1 py-1 bg-gray-100 rounded-sm mr-1">
            {name}:{' '}
         </button>
         <span className="text-left self-center max-w-full truncate">{value}</span>
      </div>
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
      <span className="min-w-fit mr-2">url: </span>
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
