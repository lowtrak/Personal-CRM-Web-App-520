import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CRMContext = createContext()

const initialState = {
  contacts: [],
  interactions: [],
  isContactModalOpen: false,
  isInteractionModalOpen: false,
  selectedContact: null,
  selectedInteraction: null,
  searchQuery: '',
  filterTag: '',
  sortBy: 'name',
  loading: false,
  error: null
}

function crmReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload, loading: false }
    
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] }
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        )
      }
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload)
      }
    
    case 'SET_INTERACTIONS':
      return { ...state, interactions: action.payload, loading: false }
    
    case 'ADD_INTERACTION':
      return { ...state, interactions: [...state.interactions, action.payload] }
    
    case 'UPDATE_INTERACTION':
      return {
        ...state,
        interactions: state.interactions.map(interaction =>
          interaction.id === action.payload.id ? action.payload : interaction
        )
      }
    
    case 'DELETE_INTERACTION':
      return {
        ...state,
        interactions: state.interactions.filter(interaction => interaction.id !== action.payload)
      }
    
    case 'OPEN_CONTACT_MODAL':
      return { ...state, isContactModalOpen: true, selectedContact: action.payload || null }
    
    case 'CLOSE_CONTACT_MODAL':
      return { ...state, isContactModalOpen: false, selectedContact: null }
    
    case 'OPEN_INTERACTION_MODAL':
      return { ...state, isInteractionModalOpen: true, selectedInteraction: action.payload || null }
    
    case 'CLOSE_INTERACTION_MODAL':
      return { ...state, isInteractionModalOpen: false, selectedInteraction: null }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'SET_FILTER_TAG':
      return { ...state, filterTag: action.payload }
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload }
    
    default:
      return state
  }
}

export function CRMProvider({ children }) {
  const [state, dispatch] = useReducer(crmReducer, initialState)
  const { user } = useAuth()

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadContacts()
      loadInteractions()
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_CONTACTS', payload: [] })
      dispatch({ type: 'SET_INTERACTIONS', payload: [] })
    }
  }, [user])

  const loadContacts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data, error } = await supabase
        .from('contacts_crm_2024')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match frontend format
      const transformedContacts = data.map(contact => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        position: contact.position,
        notes: contact.notes,
        tags: contact.tags || [],
        followUpDate: contact.follow_up_date,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }))
      
      dispatch({ type: 'SET_CONTACTS', payload: transformedContacts })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const loadInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('interactions_crm_2024')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      
      // Transform data to match frontend format
      const transformedInteractions = data.map(interaction => ({
        id: interaction.id,
        contactId: interaction.contact_id,
        type: interaction.type,
        date: interaction.date,
        notes: interaction.notes,
        followUpDate: interaction.follow_up_date,
        createdAt: interaction.created_at
      }))
      
      dispatch({ type: 'SET_INTERACTIONS', payload: transformedInteractions })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const addContact = async (contactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts_crm_2024')
        .insert([{
          user_id: user.id,
          first_name: contactData.firstName,
          last_name: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          notes: contactData.notes,
          tags: contactData.tags,
          follow_up_date: contactData.followUpDate || null
        }])
        .select()
        .single()

      if (error) throw error

      const transformedContact = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        notes: data.notes,
        tags: data.tags || [],
        followUpDate: data.follow_up_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      dispatch({ type: 'ADD_CONTACT', payload: transformedContact })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const updateContact = async (contactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts_crm_2024')
        .update({
          first_name: contactData.firstName,
          last_name: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          notes: contactData.notes,
          tags: contactData.tags,
          follow_up_date: contactData.followUpDate || null
        })
        .eq('id', contactData.id)
        .select()
        .single()

      if (error) throw error

      const transformedContact = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        notes: data.notes,
        tags: data.tags || [],
        followUpDate: data.follow_up_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      dispatch({ type: 'UPDATE_CONTACT', payload: transformedContact })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const deleteContact = async (contactId) => {
    try {
      const { error } = await supabase
        .from('contacts_crm_2024')
        .delete()
        .eq('id', contactId)

      if (error) throw error
      dispatch({ type: 'DELETE_CONTACT', payload: contactId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const addInteraction = async (interactionData) => {
    try {
      const { data, error } = await supabase
        .from('interactions_crm_2024')
        .insert([{
          user_id: user.id,
          contact_id: interactionData.contactId,
          type: interactionData.type,
          date: interactionData.date,
          notes: interactionData.notes,
          follow_up_date: interactionData.followUpDate || null
        }])
        .select()
        .single()

      if (error) throw error

      const transformedInteraction = {
        id: data.id,
        contactId: data.contact_id,
        type: data.type,
        date: data.date,
        notes: data.notes,
        followUpDate: data.follow_up_date,
        createdAt: data.created_at
      }

      dispatch({ type: 'ADD_INTERACTION', payload: transformedInteraction })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const updateInteraction = async (interactionData) => {
    try {
      const { data, error } = await supabase
        .from('interactions_crm_2024')
        .update({
          contact_id: interactionData.contactId,
          type: interactionData.type,
          date: interactionData.date,
          notes: interactionData.notes,
          follow_up_date: interactionData.followUpDate || null
        })
        .eq('id', interactionData.id)
        .select()
        .single()

      if (error) throw error

      const transformedInteraction = {
        id: data.id,
        contactId: data.contact_id,
        type: data.type,
        date: data.date,
        notes: data.notes,
        followUpDate: data.follow_up_date,
        createdAt: data.created_at
      }

      dispatch({ type: 'UPDATE_INTERACTION', payload: transformedInteraction })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const deleteInteraction = async (interactionId) => {
    try {
      const { error } = await supabase
        .from('interactions_crm_2024')
        .delete()
        .eq('id', interactionId)

      if (error) throw error
      dispatch({ type: 'DELETE_INTERACTION', payload: interactionId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const contextValue = {
    state,
    dispatch,
    addContact,
    updateContact,
    deleteContact,
    addInteraction,
    updateInteraction,
    deleteInteraction,
    loadContacts,
    loadInteractions
  }

  return (
    <CRMContext.Provider value={contextValue}>
      {children}
    </CRMContext.Provider>
  )
}

export const useCRM = () => {
  const context = useContext(CRMContext)
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider')
  }
  return context
}