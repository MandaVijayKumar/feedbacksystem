import axios from 'axios'

const api = axios.create({
  baseURL: 'https://rukap.edu.in/api', // Node backend
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
