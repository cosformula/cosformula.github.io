import Head from 'next/head'
import { getAllPagesInSpace, getPageTitle } from 'notion-utils'
import React from 'react'
import { BlogNotionRenderer } from '../components/NotionRenderer'
import { notion } from './api'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

export const getStaticProps = async (context: any) => {
  const pageId = context.params.pageId as string
  const recordMap = await notion.getPage(pageId)

  return {
    props: {
      recordMap
    },
    revalidate: 10
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const rootNotionPageId = process.env.NOTION_ROOT_PAGE_ID!

  const pages = await getAllPagesInSpace(rootNotionPageId, undefined, notion.getPage.bind(notion), {
    traverseCollections: true
  })

  const paths = Object.keys(pages).map((pageId) => `/${pageId.replace(/-/g, '')}`)

  return {
    paths,
    fallback: false
  }
}

export default function NotionPage({ recordMap }: any) {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)

  return (
    <>
      <Head>
        {/* <meta name='description' content='React Notion X demo renderer.' /> */}
        <title>{title} - 向后兼容</title>
      </Head>

      <BlogNotionRenderer recordMap={recordMap} fullPage={true} showTableOfContents />
    </>
  )
}
