import api from "@/service/api";
import {
  PostsResponse,
  LikedPostsResponse,
  TagsResponse,
  GetPostsParams,
  GetLikedPostsParams,
  LikePostParams,
} from "@/service/types";

async function getPosts(params: GetPostsParams): Promise<PostsResponse> {
  const { limit = 10, skip = 0, userId, query, tag } = params;
  const endpoint = query || tag ? "/posts/search" : "/posts";
  const response = await api.get<PostsResponse>(endpoint, {
    params: { limit, skip, userId, query, tag },
  });
  return response.data;
}

async function getLikedPosts(
  params: GetLikedPostsParams
): Promise<LikedPostsResponse> {
  const { userId, limit = 10 } = params;
  const response = await api.get<LikedPostsResponse>("/posts/liked", {
    params: { userId, limit },
  });
  return response.data;
}

async function getTags(): Promise<TagsResponse> {
  const response = await api.get<TagsResponse>("/posts/tags");
  return response.data;
}

async function toggleLikePost(params: LikePostParams): Promise<void> {
  const { postId, userId } = params;
  await api.post(`/posts/${postId}/like`, null, {
    params: { userId },
  });
}

export const postsService = {
  getPosts,
  getLikedPosts,
  getTags,
  toggleLikePost,
};
