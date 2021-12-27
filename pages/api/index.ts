import { Client }  from '@notionhq/client'
import { NotionAPI } from 'notion-client'

// Initializing a client
export const notionClient = new Client({
  auth: process.env.NOTION_TOKEN,
})


export const notion = new NotionAPI({authToken:process.env.NOTION_TOKEN_PRIVATE, userTimeZone: 'Asia/Shanghai',userLocale: 'zh-CN'})
