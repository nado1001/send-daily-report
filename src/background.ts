import 'crx-hotreload'

import { format } from 'date-fns'

import {
  FILES_UPLOAD_API_URL,
  POST_MESSAGE_API_URL,
  TOGGL_API_URL
} from './utils/consts'
import { dateToISO } from './utils/functions'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    console.log('message is missing')

    sendResponse({
      status: false,
      reason: 'message is missing'
    })
  } else {
    chrome.storage.sync.get(
      ['token', 'channelID', 'timesChannelID', 'myName', 'toggl', 'fileType'],
      (items) => {
        const token = items.token
        const channelID = items.channelID
        const timesChannelID = items.timesChannelID
        const myName = items.myName
        const toggl = items.toggl
        const fileType = items.fileType
        console.log(sender)

        // https://stackoverflow.com/questions/54368616/no-file-data-response-in-slack-file-upload
        if (message.type === 'daily-report') {
          if (!token) {
            sendResponse({
              status: false,
              message: 'トークンを登録してください。'
            })
            return
          } else if (!channelID) {
            sendResponse({
              status: false,
              message:
                '日報を投稿するチャンネルのチャンネルIDを登録してください。'
            })
            return
          } else if (!myName) {
            sendResponse({
              status: false,
              message: '自分の名前を登録してください。'
            })
            return
          }

          const form = new FormData()
          form.append('channels', channelID)
          form.append('content', message.text)
          form.append(
            'title',
            `【日報】${myName} ${format(new Date(), 'yyyy/MM/dd')}`
          )
          form.append('filetype', fileType ? 'markdown' : 'post')

          const param = {
            method: 'POST',
            body: form,
            headers: {
              Authorization: token
            }
          }
          fetch(FILES_UPLOAD_API_URL, param)
            .then((res) => res.json())
            .then((json) => {
              console.log('post', json)
              sendResponse({
                status: true,
                message: '送信しました'
              })
            })

            .catch((e) => console.error(e.message))
        } else if (message.type === 'toggl') {
          if (!toggl) {
            sendResponse({
              status: false,
              message: 'togglのAPIトークンを登録してください。'
            })
            return
          }

          const password = 'api_token'
          const username = toggl
          const encoded = btoa(`${username}:${password}`)
          const auth = 'Basic ' + encoded
          const headers = new Headers()

          const date = new Date()
          const year = date.getFullYear()
          const month = date.getMonth()
          const today = date.getDate()
          // const today = date.getDate() - 1
          const start = new Date(year, month, today, 7)
          const end = new Date(year, month, today, 22)

          headers.append('Accept', 'application/json')
          headers.append('Authorization', auth)
          fetch(
            `${TOGGL_API_URL}time_entries?start_date=${dateToISO(
              start
            )}&end_date=${dateToISO(end)}`,
            {
              headers: headers,
              credentials: 'include'
            }
          )
            .then((response) => {
              return response.json()
            })
            .then((data) => {
              console.log(data)
              if (data.length === 0) {
                sendResponse({
                  status: false,
                  message: 'データが存在しませんでした。'
                })
                return
              }
              sendResponse({
                status: true,
                message: 'ok',
                data
              })
            })
            .catch((e) => {
              console.log(e)
              sendResponse({
                status: false,
                message: `データが取得できませんでした。\n${e}`
              })
            })
        } else if (message.type === 'times') {
          if (!token) {
            sendResponse({
              status: false,
              message: 'トークンを登録してください。'
            })
            return
          } else if (!timesChannelID) {
            sendResponse({
              status: false,
              message:
                'timesを投稿するチャンネルのチャンネルIDを登録してください。'
            })
            return
          }

          const param = {
            method: 'POST',
            body: JSON.stringify({
              channel: timesChannelID,
              text: message.text
            }),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              Authorization: token
            }
          }
          fetch(POST_MESSAGE_API_URL, param)
            .then((res) => res.json())
            .then((json) => {
              console.log('post', json)
              sendResponse({
                status: true,
                message: '送信しました'
              })
            })
            .catch((e) => console.error(e.message))
        }
      }
    )
  }

  return true
})
