import { Entry } from 'har-format';
import { createContext, Dispatch, FC, useContext, useState } from 'react';

interface ErrorContext {
   errors: Entry[];
   setErrors: Dispatch<React.SetStateAction<Entry[]>>;
   saveErrors: () => void;
   removeError: (error: Entry) => void;
}

const Context = createContext({} as ErrorContext);

export const ErrorProvider: FC = (props) => {
   const [errors, setErrors] = useState<Entry[]>([]);
   const [savedErrors, setSavedErrors] = useState<Entry[]>([]);

   const saveErrors = () => setSavedErrors(errors);

   const removeError = (error: Entry) => {
      return setErrors((errors) => errors.filter((entry) => entry.time !== error.time));
   };

   const ctx = { errors, setErrors, saveErrors, removeError };

   return <Context.Provider value={ctx} {...props} />;
};

export const useErrors = () => useContext(Context);
