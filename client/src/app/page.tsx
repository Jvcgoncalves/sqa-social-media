"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Button from "@/components/Button";
import { postsService } from "@/service/posts/posts";
import { Post } from "@/service/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState([""]);
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      loadPosts().catch(() => {
        setError("Erro ao carregar posts. Tente novamente mais tarde.");
      });
    }
  }, [page, isLoadingAuth, isAuthenticated, searchQuery, selectedTag]);

  useEffect(() => {
    loadTags().catch(() => {
      setTags([]);
    });
  }, []);

  async function loadTags() {
    try {
      const response = await postsService.getTags();
      setTags(response.tags);
    } catch {
      setTags([]);
    }
  }

  async function loadPosts() {
    try {
      setIsLoadingPosts(true);
      setError(null);

      const POSTS_PER_PAGE = 10;

      const response = await postsService.getPosts({
        skip: page * POSTS_PER_PAGE,
        limit: POSTS_PER_PAGE,
        userId: user?.id,
        query: searchQuery || undefined,
        tag: selectedTag || undefined,
      });

      if (page === 0) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }

      setHasMore(response.posts.length === POSTS_PER_PAGE);
    } catch {
      setError("Erro ao carregar posts. Tente novamente mais tarde.");
    } finally {
      setIsLoadingPosts(false);
    }
  }

  async function loadFirstPage(query: string, tag: string) {
    try {
      setIsLoadingPosts(true);
      setError(null);

      const response = await postsService.getPosts({
        skip: 0,
        limit: 10,
        userId: user?.id,
        query: query || undefined,
        tag: tag || undefined,
      });

      setPosts(response.posts);
      setHasMore(response.posts.length === 10);
    } catch {
      setError("Erro ao carregar posts. Tente novamente mais tarde.");
    } finally {
      setIsLoadingPosts(false);
    }
  }

  async function handleLike(postId: number) {
    if (!user) {
      alert("Você precisa estar autenticado para curtir posts!");
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, liked: !post.liked } : post
      )
    );

    try {
      await postsService.toggleLikePost({ postId, userId: user.id });
    } catch {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, liked: !post.liked } : post
        )
      );
      alert("Erro ao curtir post. Tente novamente.");
    }
  }

  function handleLoadMore() {
    setPage((prev) => prev + 1);
  }

  function clearFilters() {
    setSearchText("");
    setSearchQuery("");
    setSelectedTag("");
    setPage(0);
    setPosts([]);
    loadFirstPage("", "").catch(() => {
      setError("Erro ao carregar posts. Tente novamente mais tarde.");
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Header />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            color: "var(--foreground)",
          }}
        >
          Feed de Posts
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const nextQuery = searchText.trim();

            setSearchQuery(nextQuery);
            setPage(0);
            setPosts([]);
            loadFirstPage(nextQuery, selectedTag).catch(() => {
              setError("Erro ao carregar posts. Tente novamente mais tarde.");
            });
          }}
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar posts"
            style={{
              flex: "1 1 220px",
              background: "var(--card-bg)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
            }}
          />

          <select
            value={selectedTag}
            onChange={(event) => {
              setSearchText("");
              setSearchQuery("");
              setSelectedTag(event.target.value);
              setPage(0);
              setPosts([]);
            }}
            style={{
              flex: "1 1 180px",
              background: "var(--card-bg)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
            }}
          >
            <option value="">Todas as tags</option>
            {tags.filter(Boolean).map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <Button type="submit">Buscar</Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
        </form>

        {error && (
          <div
            style={{
              background: "var(--error)",
              color: "white",
              padding: "1rem",
              borderRadius: "0.375rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {isLoadingAuth || (isLoadingPosts && page === 0) ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--foreground)",
            }}
          >
            Carregando posts...
          </div>
        ) : (
          <>
            <div>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Button
                  onClick={handleLoadMore}
                  isLoading={isLoadingPosts}
                  style={{ padding: "0.75rem 2rem" }}
                >
                  Carregar mais
                </Button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "2rem",
                  color: "var(--foreground)",
                  opacity: 0.7,
                }}
              >
                Você chegou ao fim dos posts!
              </p>
            )}
          </>
        )}

        {!isLoadingAuth && !isLoadingPosts && posts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--foreground)",
              opacity: 0.7,
            }}
          >
            <p style={{ fontSize: "1.125rem" }}>Nenhum post encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}
