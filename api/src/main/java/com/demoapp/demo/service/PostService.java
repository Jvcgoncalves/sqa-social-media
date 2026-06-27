package com.demoapp.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.demoapp.demo.model.UserPostReaction;
import com.demoapp.demo.repository.UserPostReactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

  private final UserPostReactionRepository reactionRepository;
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  public PostService(UserPostReactionRepository reactionRepository) {
    this.reactionRepository = reactionRepository;
    this.restTemplate = new RestTemplate();
    this.objectMapper = new ObjectMapper();
  }

  public Map<String, Object> getPosts(Integer limit, Integer skip, Long userId) {
    try {
      StringBuilder url = new StringBuilder("https://dummyjson.com/posts");
      List<String> params = new ArrayList<>();
      
      if (limit != null) {
        params.add("limit=" + limit);
      }
      if (skip != null) {
        params.add("skip=" + skip);
      }

      if (!params.isEmpty()) {
        url.append("?").append(String.join("&", params));
      }

      String response = restTemplate.getForObject(url.toString(), String.class);
      JsonNode rootNode = objectMapper.readTree(response);

      Set<Long> likedPostIds = new HashSet<>();
      if (userId != null) {
        likedPostIds = reactionRepository.findByUserId(userId)
          .stream()
          .map(UserPostReaction::getPostId)
          .collect(Collectors.toSet());
      }

      List<Map<String, Object>> posts = new ArrayList<>();
      JsonNode postsArray = rootNode.get("posts");
      
      for (JsonNode postNode : postsArray) {
        Map<String, Object> post = new HashMap<>();
        Long postId = postNode.get("id").asLong();
        
        post.put("id", postId);
        post.put("title", postNode.get("title").asText());
        post.put("body", postNode.get("body").asText());
        post.put("liked", likedPostIds.contains(postId));
        post.put("reactions", objectMapper.convertValue(postNode.get("reactions"), Map.class));
        
        posts.add(post);
      }

      Map<String, Object> result = new HashMap<>();
      result.put("posts", posts);
      result.put("total", rootNode.get("total").asInt());
      result.put("skip", rootNode.get("skip").asInt());
      result.put("limit", rootNode.get("limit").asInt());

      return result;

    } catch (Exception e) {
      throw new RuntimeException("Erro ao buscar posts: " + e.getMessage(), e);
    }
  }

  public Map<String, Object> getLikedPosts(Long userId, Integer limit, Integer skip) {
    try {
      if (limit == null) limit = 5;
      if (skip == null) skip = 0;

      List<UserPostReaction> allLikes = reactionRepository.findByUserId(userId);
      
      List<Long> likedPostIds = allLikes.stream()
        .map(UserPostReaction::getPostId)
        .collect(Collectors.toList());

      int total = likedPostIds.size();
      
      int fromIndex = Math.min(skip, total);
      int toIndex = Math.min(skip + limit, total);
      
      List<Long> paginatedIds = likedPostIds.subList(fromIndex, toIndex);

      List<Map<String, Object>> posts = new ArrayList<>();
      
      for (Long postId : paginatedIds) {
        String url = "https://dummyjson.com/posts/" + postId;
        String response = restTemplate.getForObject(url, String.class);
        JsonNode postNode = objectMapper.readTree(response);
        
        Map<String, Object> post = new HashMap<>();
        post.put("id", postNode.get("id").asLong());
        post.put("title", postNode.get("title").asText());
        post.put("body", postNode.get("body").asText());
        post.put("liked", true);
        post.put("reactions", objectMapper.convertValue(postNode.get("reactions"), Map.class));
        
        posts.add(post);
      }

      Map<String, Object> result = new HashMap<>();
      result.put("posts", posts);
      result.put("total", total);
      result.put("skip", skip);
      result.put("limit", limit);

      return result;

    } catch (Exception e) {
      throw new RuntimeException("Erro ao buscar posts curtidos: " + e.getMessage(), e);
    }
  }

  public Map<String, Object> searchPosts(String query, String tag, Integer limit, Integer skip, Long userId) {
    try {
      StringBuilder url = new StringBuilder();
      List<String> params = new ArrayList<>();

      if (tag != null && !tag.isBlank()) {
        url.append("https://dummyjson.com/posts/tag/");
        url.append(UriUtils.encodePathSegment(tag, StandardCharsets.UTF_8));
      } else if (query != null && !query.isBlank()) {
        url.append("https://dummyjson.com/posts/search");
        params.add("q=" + UriUtils.encodeQueryParam(query, StandardCharsets.UTF_8));
      } else {
        return getPosts(limit, skip, userId);
      }

      if (limit != null) {
        params.add("limit=" + limit);
      }
      if (skip != null) {
        params.add("skip=" + skip);
      }

      if (!params.isEmpty()) {
        url.append("?").append(String.join("&", params));
      }

      String response = restTemplate.getForObject(url.toString(), String.class);
      JsonNode rootNode = objectMapper.readTree(response);

      Set<Long> likedPostIds = new HashSet<>();
      if (userId != null) {
        likedPostIds = reactionRepository.findByUserId(userId)
          .stream()
          .map(UserPostReaction::getPostId)
          .collect(Collectors.toSet());
      }

      List<Map<String, Object>> posts = new ArrayList<>();
      JsonNode postsArray = rootNode.get("posts");

      for (JsonNode postNode : postsArray) {
        Map<String, Object> post = new HashMap<>();
        Long postId = postNode.get("id").asLong();

        post.put("id", postId);
        post.put("title", postNode.get("title").asText());
        post.put("body", postNode.get("body").asText());
        post.put("liked", likedPostIds.contains(postId));
        post.put("reactions", objectMapper.convertValue(postNode.get("reactions"), Map.class));

        posts.add(post);
      }

      Map<String, Object> result = new HashMap<>();
      result.put("posts", posts);
      result.put("total", rootNode.get("total").asInt());
      result.put("skip", rootNode.get("skip").asInt());
      result.put("limit", rootNode.get("limit").asInt());

      return result;

    } catch (Exception e) {
      throw new RuntimeException("Erro ao buscar posts: " + e.getMessage(), e);
    }
  }

  public Map<String, Object> getTags() {
    try {
      String response = restTemplate.getForObject("https://dummyjson.com/posts/tags", String.class);
      JsonNode rootNode = objectMapper.readTree(response);
      List<String> tags = new ArrayList<>();

      for (JsonNode tagNode : rootNode) {
        if (tagNode.isTextual()) {
          tags.add(tagNode.asText());
        } else if (tagNode.has("slug")) {
          tags.add(tagNode.get("slug").asText());
        } else if (tagNode.has("name")) {
          tags.add(tagNode.get("name").asText());
        }
      }

      Map<String, Object> result = new HashMap<>();
      result.put("tags", tags);

      return result;

    } catch (Exception e) {
      throw new RuntimeException("Erro ao buscar tags: " + e.getMessage(), e);
    }
  }

  public Map<String, Object> toggleLike(Long postId, Long userId) {
    Optional<UserPostReaction> existing = reactionRepository.findByUserIdAndPostId(userId, postId);
    
    boolean liked;
    if (existing.isPresent()) {
      reactionRepository.delete(existing.get());
      liked = false;
    } else {
      UserPostReaction reaction = new UserPostReaction();
      reaction.setUserId(userId);
      reaction.setPostId(postId);
      reactionRepository.save(reaction);
      liked = true;
    }

    Map<String, Object> result = new HashMap<>();
    result.put("postId", postId);
    result.put("liked", liked);
    
    return result;
  }

}
