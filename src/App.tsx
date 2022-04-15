import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { Entry, Har, Header } from 'har-format';
import './index.css';

const App = () => {
   const uploadRef = useRef<HTMLInputElement | null>(null);
   const pasteRef = useRef<HTMLTextAreaElement | null>(null);

   const [har, setHar] = useState<Har | undefined>(undefined);
   const [errors, setErrors] = useState<Entry[]>([]);

   const handleHarUpload = async () => {
      setHar(undefined);
      const har = uploadRef.current?.files?.[0] || undefined;
      if (!har) return alert('no file selected');

      const file = await har.text();
      setHar(JSON.parse(file));
   };

   const handleHarPaste = () => {
      setHar(undefined);

      if (!pasteRef.current) return;
      const parsed = JSON.parse(pasteRef.current.value);
      setHar(parsed);
   };

   const errorFilter = (entries: Entry[]) => {
      const success = /^2[\d+]/;

      return entries.filter(({ response }) => {
         if (response.status.toString() === '0') return;
         return !success.test(response.status.toString());
      });
   };

   useEffect(() => {
      if (!har) return;
      const errors = errorFilter(har.log.entries);

      if (!errors.length) return alert('no errors found in HAR file');
      setErrors(errors);
   }, [har]);

   return (
      <div className="flex flex-col space-y-4 p-10">
         <h1 className="text-3xl text-red-500">Error Reporter</h1>
         <input ref={uploadRef} type="file" onChange={handleHarUpload} />
         <textarea placeholder="paste har here" ref={pasteRef} onChange={handleHarPaste} />

         {errors.map((error) => (
            <ErrorPanel key={error.time} {...error} />
         ))}
      </div>
   );
};

export default App;

const ErrorPanel = (error: Entry) => {
   const { request, response } = error;

   const { method, url } = request;
   const { status } = response;

   // const [reqHeaders, setReqHeaders] = useState<string[]>([]);
   // const [resHeaders, setResHeaders] = useState<string[]>([]);

   // const headerMapper = (headers: Header[], chosen: string[]) =>
   //    headers.filter(({ name, value }) => {
   //       return chosen.includes(name) && { name, value };
   //    });

   // const getHeaderTypes = (headers: Header[]) => headers.map(({ name }) => name);

   // const handleAddReqheaders = (e: BaseSyntheticEvent) => {
   //    const header = e.target.innerHTML;
   //    if (reqHeaders.includes(header)) return;

   //    return setReqHeaders((h) => [...h, header]);
   // };

   // const handleRemoveReqHeaders = (name: string) =>
   //    setReqHeaders((headers) => {
   //       return headers.filter((header) => header !== name);
   //    });

   const { headerTypes, headersToLog, handleAddHeads, handleRemoveHeads } = useHeaders(request.headers);

   return (
      <div className="flex flex-col ">
         <div className="grid grid-cols-2 font-mono text-xs">
            <div className="flex flex-col space-y-2 items-start">
               <h1>Request</h1>
               <span>{method}</span>
               <span>{url}</span>
               {headersToLog.map(({ name, value }) => (
                  <button onClick={() => handleRemoveHeads(name)}>
                     <span>{name}: </span>
                     <span>{value}</span>
                  </button>
               ))}
               <div>
                  <span>Add headers</span>
                  <ul>
                     {headerTypes.map((header) => (
                        <li key={header}>
                           <button onClick={handleAddHeads}>{header}</button>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
            <div>
               <h1>response</h1>
               <span>{status}</span>
            </div>
         </div>
      </div>
      // return (
      //    <div className="flex flex-col ">
      //       <div className="grid grid-cols-2 font-mono text-xs">
      //          <div className="flex flex-col space-y-2 items-start">
      //             <h1>Request</h1>
      //             <span>{method}</span>
      //             <span>{url}</span>
      //             {headerMapper(request.headers, reqHeaders).map(({ name, value }) => (
      //                <button onClick={() => handleRemoveReqHeaders(name)}>
      //                   <span>{name}: </span>
      //                   <span>{value}</span>
      //                </button>
      //             ))}
      //             <div>
      //                <span>Add headers</span>
      //                <ul>
      //                   {getHeaderTypes(request.headers).map((header) => (
      //                      <li key={header}>
      //                         <button onClick={handleAddReqheaders}>{header}</button>
      //                      </li>
      //                   ))}
      //                </ul>
      //             </div>
      //          </div>
      //          <div>
      //             <h1>response</h1>
      //             <span>{status}</span>
      //          </div>
      //       </div>
      //    </div>
   );
};

const useHeaders = (headers: Header[]) => {
   const [heads, setHeads] = useState<string[]>([]);

   const headerTypes = headers.map(({ name }) => name);
   // const getHeaderTypes = (headers: Header[]) => headers.map(({ name }) => name);

   const headersToLog = headers.filter(({ name, value }) => {
      return heads.includes(name) && { name, value };
   });

   // const headerMapper = (headers: Header[], chosen: string[]) =>
   //    headers.filter(({ name, value }) => {
   //       return chosen.includes(name) && { name, value };
   //    });

   const handleAddHeads = (e: BaseSyntheticEvent) => {
      const header = e.target.innerHTML;
      if (heads.includes(header)) return;

      return setHeads((h) => [...h, header]);
   };
   // const handleAddReqheaders = (e: BaseSyntheticEvent) => {
   //    const header = e.target.innerHTML;
   //    if (reqHeaders.includes(header)) return;

   //    return setReqHeaders((h) => [...h, header]);
   // };

   const handleRemoveHeads = (name: string) =>
      setHeads((headers) => {
         return headers.filter((header) => header !== name);
      });
   // const handleRemoveReqHeaders = (name: string) =>
   //    setReqHeaders((headers) => {
   //       return headers.filter((header) => header !== name);
   //    });

   // return [heads, setHeads, headerTypes, headersToLog, handleAddHeads, handleRemoveHeads];

   return { state: [heads, setHeads], headerTypes, headersToLog, handleAddHeads, handleRemoveHeads };
};
