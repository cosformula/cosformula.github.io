import Head from 'next/head'
import { getPageTitle } from 'notion-utils'
import React from 'react'
import { Collection, CollectionRow, NotionRenderer, Code } from 'react-notion-x'
import { BlogNotionRenderer } from '../components/NotionRenderer'
import { notion } from './api'

export const getStaticProps = async (context: any) => {
  const recordMap = await notion.getPage(process.env.NOTION_ROOT_PAGE_ID!)

  return {
    props: {
      recordMap
    },
    revalidate: 10
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
        <title>{title} - cosformula</title>
      </Head>

      <BlogNotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        showCollectionViewDropdown={false}
        showTableOfContents
      />
    </>
  )
}
