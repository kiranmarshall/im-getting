import { BaseSyntheticEvent } from 'react';
import { Entry } from 'har-format';
import { useHeaders } from '@/hooks';

export const ErrorPanel = (error: Entry) => {
   const { request, response } = error;

   const { method, url } = request;
   const { status } = response;

   const [reqHeads, reqHeadsToLog, handleAddReq, handleRemoveReq] = useHeaders(request.headers);
   const [resHeads, resHeadsToLog, handleAddRes, handleRemoveRes] = useHeaders(response.headers);

   console.log(reqHeads, reqHeadsToLog);

   return (
      <div className="flex flex-col p-4">
         <div className="grid grid-cols-2 font-mono text-xs">
            <div className="flex flex-col space-y-2 items-start">
               <h1>Request</h1>
               <span>method: {method}</span>
               <span className="pr-2 w-full">url: {url}</span>
               {reqHeadsToLog.map(({ name, value }, index) => (
                  <AddedHeader key={`${name}${index}`} name={name} value={value} onClick={() => handleRemoveReq(name)} />
               ))}
               <div>
                  <span>Add headers</span>
                  <ul className="p-2 flex flex-col items-start">
                     {reqHeads.map((header, index) => {
                        console.log(reqHeadsToLog.includes({ name: header, value: header }));
                        return <HeaderToAdd strike={false} key={`${header}${index}`} header={header} onClick={handleAddReq} />;
                     })}
                  </ul>
               </div>
            </div>
            <div className="flex flex-col space-y-2 items-start">
               <h1>response</h1>
               <span>status: {status}</span>
               {resHeadsToLog.map(({ name, value }, index) => (
                  <AddedHeader key={`${name}${index}`} name={name} value={value} onClick={() => handleRemoveRes(name)} />
               ))}
               <span>Add headers</span>
               <div>
                  <ul>
                     {resHeads.map((header, index) => (
                        <HeaderToAdd strike={false} key={`${header}${index}`} header={header} onClick={handleAddRes} />
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
};

const AddedHeader = ({ name, value, onClick }: { name: string; value: string; onClick: () => void }) => {
   return (
      <button onClick={onClick}>
         <span>{name}: </span>
         <span>{value}</span>
      </button>
   );
};

const HeaderToAdd = ({ header, onClick, strike }: { header: string; onClick: (e: BaseSyntheticEvent) => void; strike: boolean }) => (
   <button className={strike ? 'text-red-500' : ''} onClick={onClick}>
      {header}
   </button>
);
