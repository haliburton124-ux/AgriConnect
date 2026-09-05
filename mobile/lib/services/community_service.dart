import '../core/api/api_client.dart';
import '../models/community_post.dart';
import '../models/post_comment.dart';

class CommunityService {
  CommunityService(this._api);

  final ApiClient _api;

  Future<List<CommunityPost>> listPosts({String? category, String? search}) {
    return _api.handle(
      _api.get('/community/posts', queryParameters: {
        if (category != null) 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
      }),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => CommunityPost.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<List<CommunityPost>> feed({String? category, String? search}) {
    return _api.handle(
      _api.get('/community/feed', queryParameters: {
        if (category != null) 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
      }),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => CommunityPost.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<CommunityPost> like(int id) {
    return _api.handle(
      _api.post('/community/posts/$id/like'),
      (json) => CommunityPost.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<CommunityPost> share(int id) {
    return _api.handle(
      _api.post('/community/posts/$id/share'),
      (json) => CommunityPost.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<CommunityPost> getPost(int id) {
    return _api.handle(
      _api.get('/community/posts/$id'),
      (json) => CommunityPost.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<List<PostComment>> comments(int postId) {
    return _api.handle(
      _api.get('/community/posts/$postId/comments'),
      (json) {
        final data = (json as Map<String, dynamic>)['data'] as List<dynamic>;
        return data.map((e) => PostComment.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<PostComment> addComment(int postId, String body) {
    return _api.handle(
      _api.post('/community/posts/$postId/comments', data: {'body': body}),
      (json) => PostComment.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }
}
