import { Entry, Har } from 'har-format';
import { useEffect, useRef, useState } from 'react';
import { useErrors } from '@/contexts';
import './UploadPanel.css';

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
      <div className="flex-grow my-auto ml-8">
         <div className="grid h-40 grid-cols-2 ">
            <label className="flex flex-col items-center justify-center cursor-pointer group">
               <div className="w-20 h-20 transition-transform text-7xl group-hover:scale-105">{isFirstUpload ? '⬆️' : '🔁'}</div>
               <span className="mt-4 text-xl font-medium tracking-tighter">
                  {isFirstUpload ? 'Click to upload' : 'Clear HAR and upload'}
               </span>
               <input className="place-self-center" ref={uploadRef} type="file" accept=".har" onChange={handleHarUpload} />
            </label>

            <label className="flex flex-col items-center justify-center group ">
               <div className="flex items-center justify-center w-20 h-20 overflow-hidden transition-transform bg-white rounded-full cursor-text group-hover:scale-105">
                  <textarea className="custom-text-area" ref={pasteRef} onChange={handleHarPaste} />
               </div>
               <span className="mt-4 text-xl font-medium tracking-tighter ">Paste HAR here</span>
            </label>
         </div>
      </div>
   );
};
