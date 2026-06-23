import react, {createContext,useContext, useState, useCallback,useRef} from 'react'
import { useKeyboard, useRenderer } from '@opentui/react'

type Responder = () => boolean;

type keyboardLayerContextValue = {
    push: (id: string, responder?: Responder) => void;
    pop: 
};
