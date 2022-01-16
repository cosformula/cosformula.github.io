import Head from 'next/head'
import { getPageTitle } from 'notion-utils'
import React from 'react'
import { Collection, CollectionRow, NotionRenderer } from 'react-notion-x'
import { notion } from './api'

export const getStaticProps = async (context:any) => {
  const recordMap = await notion.getPage(process.env.NOTION_ROOT_PAGE_ID!)

  return {
    props: {
      recordMap
    },
    revalidate: 10
  }
}

export default function NotionPage({ recordMap }:any) {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)

  return (
    <>
      <Head>
        <meta name='description' content='React Notion X demo renderer.' />
        <title>{title}</title>
      </Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        rootDomain='localhost:9090' // used to detect root domain links and open this in the same tab
        components={{
          collection: Collection,
          collectionRow: CollectionRow
        }}
      />
    </>
  )
}