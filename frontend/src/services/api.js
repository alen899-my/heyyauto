// src/api.js (or wherever you handle API requests)



export const fetchData = async () => {
  const response = await fetch('http://localhost:5000/');
  const data = await response.json();
  return data;
};