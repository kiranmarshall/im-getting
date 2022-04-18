import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { Entry, Har, Header } from 'har-format';
import './index.css';
import { ErrorPanel } from './components';

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