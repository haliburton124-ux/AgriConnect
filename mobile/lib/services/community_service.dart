import 'package:dio/dio.dart';

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

  Future<CommunityPost> share(int id, {String? caption}) {
    return _api.handle(
      _api.post('/community/posts/$id/share', data: {
        if (caption != null && caption.isNotEmpty) 'caption': caption,
      }),
      (json) => CommunityPost.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }

  Future<CommunityPost> getPost(int id, {int? shareId}) {
    return _api.handle(
      _api.get('/community/posts/$id', queryParameters: {
        if (shareId != null) 'share_id': shareId,
      }),
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

  Future<PostComment> addComment(
    int postId, {
    String? body,
    int? parentId,
    String? imagePath,
  }) async {
    if (imagePath != null && imagePath.isNotEmpty) {
      final form = FormData.fromMap({
        if (body != null && body.trim().isNotEmpty) 'body': body.trim(),
        if (parentId != null) 'parent_id': parentId,
        'image': await MultipartFile.fromFile(imagePath),
      });

      return _api.handle(
        _api.postMultipart('/community/posts/$postId/comments', form),
        (json) => PostComment.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
      );
    }

    return _api.handle(
      _api.post('/community/posts/$postId/comments', data: {
        'body': body?.trim() ?? '',
        if (parentId != null) 'parent_id': parentId,
      }),
      (json) => PostComment.fromJson((json as Map<String, dynamic>)['data'] as Map<String, dynamic>),
    );
  }
}
