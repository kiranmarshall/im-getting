import { Entry, Har } from 'har-format';
import { useEffect, useRef, useState } from 'react';
import { useErrors } from '@/contexts';
import './UploadPanel.css';

export const errorTypes = {
   information: /^1[\d+]/,
   success: /^2[\d+]/,
   redirect: /^3[\d+]/,
   user: /^4[\d+]/,
   server: /^5[\d+]/,
};

export const UploadPanel = ({ codes }: { codes: RegExp[] }) => {
   const uploadRef = useRef<HTMLInputElement | null>(null);
   const pasteRef = useRef<HTMLTextAreaElement | null>(null);

   const [isFirstUpload, setIsFirstUpload] = useState(true);

   const [har, setHar] = useState<Har | undefined>(undefined);
   const { setErrors } = useErrors();

   const handleHarUpload = async () => {
      const uploaded = uploadRef.current?.files?.[0] || undefined;
      if (!uploaded) return alert('no file selected');
      setErrors([]);

      const { name } = uploaded;
      setHar(undefined);

      if (!/\.har$/.test(name)) return alert('Please upload a .har file');

      const har = await uploaded.text();
      setHar(JSON.parse(har));
   };

   const handleHarPaste = () => {
      setHar(undefined);

      if (!pasteRef.current) return;
      const parsed = JSON.parse(pasteRef.current.value);
      setHar(parsed);
   };

   const errorFilter = (entries: Entry[]) => {
      return entries.filter(({ response }) => {
         if (response.status.toString() === '0') return;

         for (const code of codes) {
            if (code.test(`${response.status}`)) return response;
         }
         return;
      });
   };

   useEffect(() => {
      if (!har) return;
      const errors = errorFilter(har.log.entries);

      setIsFirstUpload(false);
      if (!errors.length) return alert('no errors found in HAR file');
      setErrors(errors);
   }, [har, codes]);

   return (
      <div className="ml-8 flex-grow my-auto">
         <div className="grid grid-cols-2 h-40">
            <label className="flex flex-col items-center justify-center group cursor-pointer">
               <div className="text-7xl h-20 w-20 group-hover:scale-105 transition-transform">{isFirstUpload ? '⬆️' : '🔁'}</div>
               <span className="text-xl font-medium tracking-tighter mt-4">
                  {isFirstUpload ? 'Click to upload' : 'Clear HAR and upload'}
               </span>
               <input className="place-self-center" ref={uploadRef} type="file" accept=".har" onChange={handleHarUpload} />
            </label>

            <label className="flex flex-col items-center justify-center group ">
               <div className="bg-white rounded-full h-20 w-20 flex  items-center justify-center overflow-hidden cursor-text group-hover:scale-105 transition-transform">
                  <textarea className="custom-text-area" ref={pasteRef} onChange={handleHarPaste} />
               </div>
               <span className=" text-xl font-medium tracking-tighter mt-4">Paste HAR here</span>
            </label>
         </div>
      </div>
   );
};
