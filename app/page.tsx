import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        cosformula
      </h1>
      {/* <p className="mb-4">
      <a href="https://wakatime.com/@41fdecfe-e524-4e64-a686-e00e43a57b8c"><img src="https://wakatime.com/badge/user/41fdecfe-e524-4e64-a686-e00e43a57b8c.svg" alt="Total time coded since Aug 1 2019" /></a>
      </p> */}
      <p className="mb-4">
        {`产品工程师，游戏开发者。`}
      </p>
      <p className="mb-4">
        {`Product Engineer, Game Developer.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
