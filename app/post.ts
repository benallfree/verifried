import parseFrontMatter from 'front-matter'
import fs from 'fs/promises'
import { marked } from 'marked'
import path from 'path'
import invariant from 'tiny-invariant'

export type PostMeta = {
  slug: string
  title: string
}

export type Post_InMemory = Post_AtRest & {
  html: string
}

export type Post_AtRest = PostMeta & {
  markdown: string
}

export type PostMarkdownAttributes = {
  title: string
}

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title
}

const postsPath = path.join(__dirname, '..', 'posts')

export async function getPost(slug: string): Promise<Post_InMemory> {
  const filepath = path.join(postsPath, slug + '.md')
  console.log(filepath)
  const file = await fs.readFile(filepath)
  const { attributes, body } = parseFrontMatter(file.toString())
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filepath} is missing attributes`
  )
  const html = marked(body)
  return { slug, html, markdown: body, title: attributes.title }
}

export async function getPosts() {
  const dir = await fs.readdir(postsPath)
  return Promise.all<PostMeta>(
    dir.map(async (filename) => {
      const file = await fs.readFile(path.join(postsPath, filename))
      const { attributes, body } = parseFrontMatter(file.toString())
      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad meta data!`
      )
      return {
        slug: filename.replace(/\.md$/, ''),
        title: attributes.title,
      }
    })
  )
}

export async function createOrUpdatePost(post: Post_AtRest) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`
  await fs.writeFile(path.join(postsPath, post.slug + '.md'), md)
  return getPost(post.slug)
}
