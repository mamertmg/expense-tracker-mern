import React, {createContext, useReducer} from "react";
import axios from 'axios';

// Initial state
const initialState = {
    transactions: [],
    error: null,
    loading: true
}

// Create context
export const GlobalContext = createContext(initialState);


// Reducer function to modify state according to received actions
export const AppReducer = (state, action) => {
    switch(action.type) {
      case 'GET_TRANSACTIONS':
        return {
          ...state,
          loading: false,
          transactions: action.payload
        }
      case 'DELETE_TRANSACTION':
        return {
          ...state,
          transactions: state.transactions.filter(transaction => transaction._id !== action.payload)
        }
      case 'ADD_TRANSACTION':
        return {
          ...state,
          transactions: [...state.transactions, action.payload]
        }
      case 'TRANSACTION_ERROR':
        return {
          ...state,
          error: action.payload
        }
      default:
        return state;
    }
}


// Provider component
export const GlobalProvider = ({children}) => {
    const [state,dispatch] = useReducer(AppReducer,initialState)

    // Actions creators. Dispatch action objects to reducer
    async function getTransactions() {
      try {
        const res = await axios.get('/api/v1/transactions');
  
        dispatch({
          type: 'GET_TRANSACTIONS',
          payload: res.data.data
        });
      } catch (err) {
        dispatch({
          type: 'TRANSACTION_ERROR',
          payload: err.response.data.error
        });
      }
    }

    async function addTransaction(transaction) {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      try {
        const res = await axios.post('/api/v1/transactions', transaction, config);
  
        dispatch({
          type: 'ADD_TRANSACTION',
          payload: res.data.data
        });
      } catch (err) {
        dispatch({
          type: 'TRANSACTION_ERROR',
          payload: err.response.data.error
        });
      }
    }

    async function deleteTransaction(id) {
      try {
        await axios.delete(`/api/v1/transactions/${id}`);
  
        dispatch({
          type: 'DELETE_TRANSACTION',
          payload: id
        });
      } catch (err) {
        dispatch({
          type: 'TRANSACTION_ERROR',
          payload: err.response.data.error
        });
      }
    }

    return (<GlobalContext.Provider value={{
        transactions: state.transactions,
        error: state.error,
        loading: state.loading,
        addTransaction,
        deleteTransaction,
        getTransactions
    }}>
        {children}
    </GlobalContext.Provider>)
}