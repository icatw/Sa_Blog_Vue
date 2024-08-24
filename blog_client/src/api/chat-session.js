import axios from 'axios';

const baseChatUrl = 'http://localhost:8999';

export const queryChatSession = (query) => {
    return axios.post(`chatApi/chatSession/query`, query)
}

export const saveChatSession = (data) => {
    if (data.id) {
        return axios.post('chatApi'+`/chatSession/${data.id}/update`, data)
    }
    return axios.post('chatApi'+`/chatSession/create`, data)
}

export const findChatSessionById = (id) => {
    return axios.get(`chatApi/chatSession/` + id)
}

export const invalidChatSession = (id) => {
    return axios.post(`chatApi/chatSession/${id}/invalid`)
}

export const validChatSession = (id) => {
    return axios.post(`chatApi/chatSession/${id}/valid`)
}

export const deleteChatSession = (ids) => {
    return axios.post(`chatApi/chatSession/delete`, ids)
}