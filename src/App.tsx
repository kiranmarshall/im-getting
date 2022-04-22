import { ErrorPanel, UploadPanel } from './components';
import { MarkdownProvider, useErrors } from './contexts';
import './index.css';

const App = () => {
   const { errors } = useErrors();

   return (
      <div className="flex flex-col space-y-4 p-10">
         <h1 className="text-7xl font-extrabold tracking-tighter text-red-500">I'm getting...</h1>

         <UploadPanel />

         {!!errors.length && <span>Total Errors: {errors.length}</span>}

         {errors.map((error) => (
            <MarkdownProvider key={error.time}>
               <ErrorPanel {...error} />
            </MarkdownProvider>
         ))}
      </div>
   );
};

export default App;
