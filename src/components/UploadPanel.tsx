import { Entry, Har } from 'har-format';
import { useEffect, useRef, useState } from 'react';
import { useErrors } from '@/contexts';
import './UploadPanel.css';

export const UploadPanel = () => {
   const uploadRef = useRef<HTMLInputElement | null>(null);
   const pasteRef = useRef<HTMLTextAreaElement | null>(null);

   const [showUploader, setShowUploader] = useState(false);

   const [har, setHar] = useState<Har | undefined>(undefined);
   const { setErrors } = useErrors();

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
      const redirect = /^3[\d+]/;
      const information = /^1[\d+]/;

      return entries.filter(({ response }) => {
         if (response.status.toString() === '0') return;
         if (success.test(response.status.toString())) return;
         if (redirect.test(response.status.toString())) return;
         if (information.test(response.status.toString())) return;
         return response;
      });
   };

   useEffect(() => {
      if (!har) return;
      const errors = errorFilter(har.log.entries);

      if (!errors.length) return alert('no errors found in HAR file');
      setShowUploader(false);
      setErrors(errors);
   }, [har]);

   console.log(showUploader);

   return (
      <div className="flex-grow">
         {/* {har && <button onClick={() => setShowUploader((s) => !s)}>Show Uploader</button>} */}

         <div className="grid grid-cols-2 h-40">
            <label className="flex flex-col items-center justify-center group cursor-pointer">
               <div className="text-7xl group-hover:scale-105 transition-transform">⬆️</div>
               <span className="font-semobild tracking-tight mt-4">Click to upload</span>
               <input className="place-self-center" ref={uploadRef} type="file" onChange={handleHarUpload} />
            </label>

            <label className="flex flex-col items-center justify-center group ">
               <div className="bg-white rounded-full h-20 w-20 flex  items-center justify-center overflow-hidden cursor-text group-hover:scale-105 transition-transform">
                  <textarea className="custom-text-area" ref={pasteRef} onChange={handleHarPaste} />
               </div>
               <span className="font-semobild tracking-tight mt-4">Paste HAR here</span>
            </label>
         </div>
      </div>
   );
};
