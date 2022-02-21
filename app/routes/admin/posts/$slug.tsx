import { useEffect, useState } from 'react'
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'
import { createOrUpdatePost, getPost, Post_AtRest, Post_InMemory } from '~/post'

type PostError = {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()

  const title = formData.get('title')
  const markdown = formData.get('markdown')

  invariant(params.slug, 'expected params.slug')

  const post = await getPost(params.slug)

  const errors: PostError = {}
  if (!title) errors.title = true
  if (!markdown) errors.markdown = true
  invariant(typeof title === 'string')
  invariant(typeof markdown === 'string')

  if (Object.keys(errors).length) {
    return errors
  }

  await new Promise((res) => setTimeout(res, 1000))

  await createOrUpdatePost({ title, slug: post.slug, markdown })

  return redirect('/admin')
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'expected params.slug')
  console.log('params', params)
  return getPost(params.slug)
}

export default function EditPost() {
  const post = useLoaderData<Post_InMemory>()
  const errors = useActionData<PostError>()
  const transition = useTransition()
  const [postState, setPostState] = useState<Post_AtRest>(post)

  useEffect(() => {
    setPostState(post)
  }, [post])
  return (
    <Form method="post">
      <h1>Edit</h1>
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}{' '}
          <input
            type="text"
            name="title"
            value={postState.title}
            onChange={(e) =>
              setPostState((state) => ({ ...state, title: e.target.value }))
            }
          />
        </label>
      </p>
      <p>
        <label>Post Slug: {post.slug}</label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{' '}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          value={postState.markdown}
          onChange={(e) =>
            setPostState((state) => ({ ...state, markdown: e.target.value }))
          }
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Updating...' : 'Update Post'}
        </button>
      </p>
    </Form>
  )
}
