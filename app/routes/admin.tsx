import { Link, Outlet, useLoaderData } from 'remix'
import type { Post_InMemory } from '~/post'
import { getPosts } from '~/post'
import adminStyles from '~/styles/admin.css'

export const loader = async () => {
  return getPosts()
}

export const links = () => {
  return [{ rel: 'stylesheet', href: adminStyles }]
}

export default function Admin() {
  const posts = useLoaderData<Post_InMemory[]>()
  return (
    <div className="admin">
      <nav>
        <h1>
          <a href="/admin">Admin</a>
        </h1>
        <h1>
          <a href="/">Exit</a>
        </h1>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/admin/posts/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
