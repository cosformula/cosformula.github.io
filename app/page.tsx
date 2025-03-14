import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        cosformula
      </h1>
      <p className="mb-4">
        {`产品工程师，游戏开发者。`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
