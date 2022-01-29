import { Collection, CollectionRow, NotionRenderer, Code, useNotionContext } from 'react-notion-x'
import { css } from '@emotion/css'
// import ImgixClient from '@imgix/js-core'

// const client = new ImgixClient({
//   domain: 'cosformula.imgix.net',
//   secureURLToken: 'EHYknnWYbcyX6qFw',
//   includeLibraryParam: false
// })

// const CDN_HOST = 'cosformula-image.oss-cn-shanghai.aliyuncs.com'
// const CDN_HOST = 'https://service-mi3rzgn9-1251724012.sh.apigw.tencentcs.com/release/'
// const CDN_HOST = 'https://image-store-1251724012.cos.ap-shanghai.myqcloud.com/release/'
// const CDN_HOST = 'http://localhost:9000/'
const CDN_HOST = 'https://image-store-1251724012.file.myqcloud.com/release/'

const encodeBase64Url = (str: string) => {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const BlogNotionRenderer = (props: any) => {
  const { mapImageUrl } = useNotionContext()
  return (
    <NotionRenderer
      fullPage={true}
      darkMode={false}
      showCollectionViewDropdown={false}
      showTableOfContents
      rootDomain="localhost:3000"
      components={{
        code: Code,
        collection: Collection,
        collectionRow: CollectionRow
      }}
      // customImages
      rootPageId={process.env.NOTION_ROOT_PAGE_ID}
      mapImageUrl={(url, block) => {
        const signedUrl = new URL(mapImageUrl(url, block))
        const urlParts = signedUrl.pathname.split('/')
        const realUrl = `${decodeURIComponent(urlParts[2])}`

        return `${CDN_HOST}${encodeURIComponent(encodeBase64Url(realUrl))}${signedUrl.search}`
      }}
      {...props}
    />
  )
}
