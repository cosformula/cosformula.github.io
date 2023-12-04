import { Collection, CollectionRow, NotionRenderer, Code, useNotionContext } from 'react-notion-x'
// const CDN_HOST = 'https://image-store-1251724012.file.myqcloud.com/release/'

// const encodeBase64Url = (str) => {
//   return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
// }

export const BlogNotionRenderer = (props) => {
  // const { mapImageUrl } = useNotionContext()
  const { components, ...rest } = props
  return (
    <NotionRenderer
      // fullPage={true}
      // darkMode={false}
      // showCollectionViewDropdown={false}
      // showTableOfContents
      // rootDomain='localhost:3000'
      components={{
        code: Code,
        collection: Collection,
        collectionRow: CollectionRow,
        ...components
      }}
      // customImages
      // rootPageId={process.env.NOTION_ROOT_PAGE_ID}
      // mapImageUrl={(url, block) => {
      //   const signedUrl = new URL(mapImageUrl(url, block))

      //   if (process.env.VERCEL_ENV) {
      //     // console.log('vercel env')
      //     return signedUrl
      //   }
      //   const urlParts = signedUrl.pathname.split('/')
      //   const realUrl = `${decodeURIComponent(urlParts[2])}`

      //   return `${CDN_HOST}${encodeURIComponent(encodeBase64Url(realUrl))}${signedUrl.search}`
      // }}
      {...rest}
    />
  )
}
