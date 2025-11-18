import axios from 'axios'

const API_BASE_URL = 'https://localhost:44367/api/mail'

export const mailService = {
  async getInboxEmails(accountEmail) {
    try {
      const response = await axios.get(`${API_BASE_URL}/inbox/${encodeURIComponent(accountEmail)}`)
      return response.data
    } catch (error) {
      console.error('Error fetching inbox emails:', error)
      throw error
    }
  },

  async getSentEmails(accountEmail) {
    try {
      const response = await axios.get(`${API_BASE_URL}/sent/${encodeURIComponent(accountEmail)}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sent emails:', error)
      throw error
    }
  },

  async getEmailById(accountEmail, emailId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${encodeURIComponent(accountEmail)}/${emailId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching email:', error)
      throw error
    }
  }
}


