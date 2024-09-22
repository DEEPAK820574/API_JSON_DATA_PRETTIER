import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables
  const [apiUrl, setApiUrl] = useState('');
  const [propertiesInfo, setPropertiesInfo] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Map()); // Use Map to track open/close state

  // Function to fetch data from the API
  const fetchApiData = async () => {
    setError('');
    setLoading(true);
    setPropertiesInfo([]);
    setExpandedItems(new Map()); // Reset expanded states

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (Array.isArray(data)) {
        if (data.length > 0 ) {
          // Process the first object in the array to extract properties
          const propertiesInfo = getPropertiesWithTypes(data);
          setPropertiesInfo(propertiesInfo);
        } else {
          setError('The API returned an array but no valid objects.');
        }
      } else if (typeof data === 'object') {
        const propertiesInfo = getPropertiesWithTypes(data);
        setPropertiesInfo(propertiesInfo);
      } else {
        setError('The API did not return a valid JSON object or array of objects.');
      }
    } catch (err) {
      setError('Failed to fetch data. Please check the API URL.');
    } finally {
      setLoading(false);
    }
  };

  // Function to extract properties, their types, and values
  const getPropertiesWithTypes = (obj) => {
    return Object.keys(obj).map((key) => {
      const value = obj[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      return {
        property: key,
        type,
        value, // Store the actual value for further nesting
      };
    });
  };

  // Function to toggle nested object/array expansion
  const handleClick = (propertyPath) => {
    setExpandedItems((prev) => {
      const newExpandedItems = new Map(prev);
      newExpandedItems.set(propertyPath, !newExpandedItems.get(propertyPath)); // Toggle open/close state
      return newExpandedItems;
    });
  };

  // Recursive function to get nested properties
  const getNestedProperties = (value, parentPath) => {
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).map((key) => {
        const nestedValue = value[key];
        const nestedPath = `${parentPath}.${key}`; // Build a unique path for each property
        return {
          property: key,
          type: Array.isArray(nestedValue) ? 'array' : typeof nestedValue,
          value: nestedValue,
          path: nestedPath,
        };
      });
    }
    return [];
  };

  // Recursive function to render nested properties
  const renderNestedProperties = (propertyInfo, parentPath = '') => {
    const { property, type, value } = propertyInfo;
    const propertyPath = parentPath ? `${parentPath}.${property}` : property;
  
    const isValueNull = value === null; // Check if the value is null
    const isPrimitive = type !== 'object' && type !== 'array'; // Check if the value is a primitive type
  
    const isEmptyArray = type === 'array' && Array.isArray(value) && value.length === 0;
    // Define conditions for empty, undefined, or null values
    const isEmptyString = type === 'string' && value === ''; // Empty string check
    const isUndefined = value === undefined; // Undefined value check
  
    // Determine the color based on the type
    const typeColor = type === 'object' ? '#CECB25' 
                      : type === 'array' ? '#F85F35' 
                      : 'grey'; // Grey for all other types
  
    return (
      <li key={propertyPath}>
        <span onClick={() => handleClick(propertyPath)}>
          {property} {":"}{" "}
          [<span style={{ color: typeColor,fontSize:"12px" }}> {type.toUpperCase()}</span>] 
          {isValueNull && expandedItems.get(propertyPath) && (
            <span style={{ color: 'red', fontWeight: 'normal', opacity: '0.65' }}>{" "}== null</span>
          )}
          {isEmptyString && expandedItems.get(propertyPath) && (
            <span style={{ color: 'red', fontWeight: 'normal', opacity: '0.65' }}>{" "}== " "</span>
          )}
          {isUndefined && expandedItems.get(propertyPath) && (
            <span style={{ color: 'red', fontWeight: 'normal', opacity: '0.65' }}>{" "}== undefined</span>
          )}
          {isPrimitive && !isValueNull && !isEmptyString && !isUndefined && expandedItems.get(propertyPath) && (
            <span style={{ color: 'green', fontWeight: 'normal', opacity: '0.65', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
             {" "} == {String(value)}
            </span>
          )}
           {isEmptyArray && expandedItems.get(propertyPath) && (
          <span style={{ color: 'green', fontWeight: 'normal', opacity: '0.65' }}>
            {" "} == [<span style={{ color: 'red', fontWeight: 'normal', opacity: '0.8',fontSize:"12px" }}>No_Value</span>]
          </span>
        )}
        </span>
  
        {expandedItems.get(propertyPath) && !isValueNull && !isPrimitive && (
          <ul>
            {getNestedProperties(value, propertyPath).map((nestedProp) =>
              renderNestedProperties(nestedProp, propertyPath)
            )}
          </ul>
        )}
      </li>
    );
  };
  


  return (
    <div className="App">
      <h1>API JSON Data Prettier</h1>

      <input
        type="text"
        value={apiUrl}
        placeholder="Enter API URL"
        onChange={(e) => setApiUrl(e.target.value)}
      />

      <button onClick={fetchApiData} disabled={!apiUrl || loading}>
        {loading ? 'Loading...' : 'Fetch Properties with Types'}
      </button>

      {error && <p className="error">{error}</p>}

      {propertiesInfo.length > 0 && (
        <div>
          <h2>DATA</h2>
          <ul>
            {propertiesInfo.map((propertyInfo) => renderNestedProperties(propertyInfo))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
