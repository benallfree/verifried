import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'
import { createOrUpdatePost } from '~/post'

type PostError = {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const title = formData.get('title')
  const slug = formData.get('slug')
  const markdown = formData.get('markdown')

  const errors: PostError = {}
  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true
  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')

  if (Object.keys(errors).length) {
    return errors
  }

  await new Promise((res) => setTimeout(res, 1000))

  await createOrUpdatePost({ title, slug, markdown })

  return redirect('/admin')
}

export default function NewPost() {
  const errors = useActionData<PostError>()
  const transition = useTransition()
  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}{' '}
          <input type="text" name="title" />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}{' '}
          <input type="text" name="slug" />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{' '}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea id="markdown" rows={20} name="markdown" />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Creating...' : 'Create Post'}
        </button>
      </p>
    </Form>
  )
}
