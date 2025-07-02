import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CRMContext = createContext();

const initialState = {
  contacts: [],
  interactions: [],
  isContactModalOpen: false,
  isInteractionModalOpen: false,
  selectedContact: null,
  selectedInteraction: null,
  searchQuery: '',
  filterTag: '',
  sortBy: 'name'
};

function crmReducer(state, action) {
  switch (action.type) {
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    
    case 'ADD_CONTACT':
      const newContact = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastInteraction: null
      };
      return { ...state, contacts: [...state.contacts, newContact] };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        )
      };
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload)
      };
    
    case 'SET_INTERACTIONS':
      return { ...state, interactions: action.payload };
    
    case 'ADD_INTERACTION':
      const newInteraction = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return { ...state, interactions: [...state.interactions, newInteraction] };
    
    case 'UPDATE_INTERACTION':
      return {
        ...state,
        interactions: state.interactions.map(interaction =>
          interaction.id === action.payload.id ? action.payload : interaction
        )
      };
    
    case 'DELETE_INTERACTION':
      return {
        ...state,
        interactions: state.interactions.filter(interaction => interaction.id !== action.payload)
      };
    
    case 'OPEN_CONTACT_MODAL':
      return {
        ...state,
        isContactModalOpen: true,
        selectedContact: action.payload || null
      };
    
    case 'CLOSE_CONTACT_MODAL':
      return {
        ...state,
        isContactModalOpen: false,
        selectedContact: null
      };
    
    case 'OPEN_INTERACTION_MODAL':
      return {
        ...state,
        isInteractionModalOpen: true,
        selectedInteraction: action.payload || null
      };
    
    case 'CLOSE_INTERACTION_MODAL':
      return {
        ...state,
        isInteractionModalOpen: false,
        selectedInteraction: null
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTER_TAG':
      return { ...state, filterTag: action.payload };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    default:
      return state;
  }
}

export function CRMProvider({ children }) {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('crm-contacts');
    const savedInteractions = localStorage.getItem('crm-interactions');
    
    if (savedContacts) {
      dispatch({ type: 'SET_CONTACTS', payload: JSON.parse(savedContacts) });
    }
    
    if (savedInteractions) {
      dispatch({ type: 'SET_INTERACTIONS', payload: JSON.parse(savedInteractions) });
    }
  }, []);

  // Save data to localStorage when contacts or interactions change
  useEffect(() => {
    localStorage.setItem('crm-contacts', JSON.stringify(state.contacts));
  }, [state.contacts]);

  useEffect(() => {
    localStorage.setItem('crm-interactions', JSON.stringify(state.interactions));
  }, [state.interactions]);

  return (
    <CRMContext.Provider value={{ state, dispatch }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};