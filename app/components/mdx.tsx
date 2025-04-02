import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
// import { MDXRemote } from 'next-mdx-remote'
import { highlight } from 'sugar-high'
import React, { ComponentProps } from 'react'
import remarkMath from 'remark-math'
// import remarkGfm from 'remark-gfm'
// import rehypeRaw from 'rehype-raw'
import remarkCallout from "@r4ai/remark-callout";
// import remarkObsidian from 'remark-obsidian';
// import remarkObsidian from '@thecae/remark-obsidian';

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} fill className="rounded-lg" {...props} />
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  // img: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
  // p: ({ className, ...props }: any) => (
  //   <p className="my-4 text-neutral-800 dark:text-neutral-200" {...props} />
  // ),
  blockquote: ({ className,children, ...props }: any) => {
    return <blockquote className="px-2 py-2 my-1 border-s-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800 text-gray-900 dark:text-white"  {...props} children={children}>
      </blockquote>  
  },
  img: ({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
  hr: ({ ...props }) => <hr className="typo-hr" {...props} />,
  pre: ({ className, ...props }: any) => <pre className='my-4' {...props} />,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options= {{
        mdxOptions: {
          remarkPlugins: [
            remarkMath,
            // remarkGfm,
            remarkCallout,
            // remarkObsidian
          ],
          // rehypePlugins: [rehypeRaw],
          format: 'mdx',
        }
      }}
    />
  )
}
