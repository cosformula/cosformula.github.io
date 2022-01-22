import React from 'react'
import Head from 'next/head'

import { getPageTitle, getAllPagesInSpace } from 'notion-utils'
import { Code, Collection, CollectionRow, NotionRenderer } from 'react-notion-x'
import { notion } from './api'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

export const getStaticProps = async (context:any) => {
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

  const rootNotionPageId =  process.env.NOTION_ROOT_PAGE_ID!
  const rootNotionSpaceId = process.env.NOTION_WORKSPACE_ID!

  const pages = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    notion.getPage.bind(notion),
    {
      traverseCollections: false
    }
  )

  const paths = Object.keys(pages).map((pageId) => `/${pageId}`)

  return {
    paths,
    fallback: true
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
        {/* <meta name='description' content='React Notion X demo renderer.' /> */}
        <title>{title} - 向后兼容</title>
      </Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        showTableOfContents
        rootDomain='cosformula.org' 
        components={{
          code: Code,
          collection: Collection,
          collectionRow: CollectionRow
        }}
      />
    </>
  )
}