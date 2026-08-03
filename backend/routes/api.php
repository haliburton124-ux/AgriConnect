<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Community\CommunityPostController;
use App\Http\Controllers\Api\V1\Content\AdvisoryController;
use App\Http\Controllers\Api\V1\Content\AnnouncementController;
use App\Http\Controllers\Api\V1\Farmer\FarmController;
use App\Http\Controllers\Api\V1\Farmer\IncidentController as FarmerIncidentController;
use App\Http\Controllers\Api\V1\Gis\GisController;
use App\Http\Controllers\Api\V1\Knowledge\KnowledgeArticleController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\Mao\DashboardController as MaoDashboardController;
use App\Http\Controllers\Api\V1\Mao\FarmerController as MaoFarmerController;
use App\Http\Controllers\Api\V1\Mao\IncidentController as MaoIncidentController;
use App\Http\Controllers\Api\V1\Mao\TechnicianController;
use App\Http\Controllers\Api\V1\Ppo\DashboardController as PpoDashboardController;
use App\Http\Controllers\Api\V1\Ppo\MunicipalityController as PpoMunicipalityController;
use App\Http\Controllers\Api\V1\Program\ProgramApplicationController;
use App\Http\Controllers\Api\V1\Program\ProgramController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\Shared\AppointmentController;
use App\Http\Controllers\Api\V1\Shared\DocumentController;
use App\Http\Controllers\Api\V1\Shared\MunicipalityDocumentController;
use App\Http\Controllers\Api\V1\Shared\MessageController;
use App\Http\Controllers\Api\V1\Shared\NotificationController;
use App\Http\Controllers\Api\V1\Technician\IncidentController as TechnicianIncidentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public authentication routes ────────────────────────────
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('resend-otp', [AuthController::class, 'resendOtp']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // ── Public content routes (no login required) ────────────────
    // Powers the Farmer landing page for guests: reference-data lookups,
    // published programs, knowledge articles, advisories, and province-wide
    // announcements. Write access to all of these still requires auth +
    // the relevant office role — see the role-scoped groups below.
    Route::middleware('throttle:api')->group(function () {
        Route::get('locations/municipalities', [LocationController::class, 'municipalities']);
        Route::get('locations/barangays', [LocationController::class, 'barangays']);
        Route::get('locations/incident-categories', [LocationController::class, 'incidentCategories']);

        Route::get('announcements', [AnnouncementController::class, 'index']);
        Route::get('advisories', [AdvisoryController::class, 'index']);

        Route::get('knowledge/categories', [KnowledgeArticleController::class, 'categories']);
        Route::get('knowledge/articles', [KnowledgeArticleController::class, 'index']);
        Route::get('knowledge/articles/{article}', [KnowledgeArticleController::class, 'show']);

        Route::get('community/categories', [CommunityPostController::class, 'categories']);
        Route::middleware('auth.optional')->group(function () {
            Route::get('community/posts', [CommunityPostController::class, 'index']);
            Route::get('community/posts/{communityPost}', [CommunityPostController::class, 'show']);
        });

        Route::get('programs', [ProgramController::class, 'index']);
        Route::get('programs/{program}', [ProgramController::class, 'show']);
    });

    // ── Authenticated routes (any active role) ──────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/logout-all', [AuthController::class, 'logoutAllDevices']);
        Route::post('auth/change-password', [AuthController::class, 'changePassword']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // Knowledge Center — write access restricted inside the request/controller
        Route::post('knowledge/articles', [KnowledgeArticleController::class, 'store']);
        Route::post('knowledge/articles/{article}/archive', [KnowledgeArticleController::class, 'archive']);
        Route::post('knowledge/articles/{id}/restore', [KnowledgeArticleController::class, 'restore']);

        // Community knowledge sharing — engagement (auth required)
        Route::get('community/feed', [CommunityPostController::class, 'feed']);
        Route::post('community/posts/{communityPost}/like', [CommunityPostController::class, 'toggleLike']);
        Route::post('community/posts/{communityPost}/share', [CommunityPostController::class, 'share']);
        Route::get('community/posts/{communityPost}/comments', [CommunityPostController::class, 'comments']);
        Route::post('community/posts/{communityPost}/comments', [CommunityPostController::class, 'storeComment']);

        // Municipality-only confidential documents
        Route::get('municipality-documents', [MunicipalityDocumentController::class, 'index']);

        // Appointments & Messaging — shared between farmer and technician
        Route::middleware('role:farmer,technician')->group(function () {
            Route::get('appointments', [AppointmentController::class, 'index']);
            Route::post('appointments', [AppointmentController::class, 'store']);
            Route::put('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

            Route::get('messages/threads', [MessageController::class, 'threads']);
            Route::get('messages/{partnerId}', [MessageController::class, 'conversation']);
            Route::post('messages', [MessageController::class, 'store']);
        });

        // Documents — every role can manage their own uploaded files
        Route::get('documents', [DocumentController::class, 'index']);
        Route::post('documents', [DocumentController::class, 'store']);
        Route::post('documents/{document}/archive', [DocumentController::class, 'archive']);
        Route::post('documents/{id}/restore', [DocumentController::class, 'restore']);

        // ── Farmer-only routes ────────────────────────────────────
        Route::middleware('role:farmer')->prefix('farmer')->group(function () {
            Route::apiResource('farms', FarmController::class)->except(['destroy'])->parameters(['farms' => 'farm']);
            Route::post('farms/{farm}/archive', [FarmController::class, 'archive']);
            Route::post('farms/{id}/restore', [FarmController::class, 'restore']);
            Route::post('farms/{farm}/boundary', [FarmController::class, 'storeBoundary']);

            Route::get('incidents', [FarmerIncidentController::class, 'index']);
            Route::post('incidents', [FarmerIncidentController::class, 'store']);
            Route::get('incidents/{incident}', [FarmerIncidentController::class, 'show']);

            Route::get('program-applications', [ProgramApplicationController::class, 'index']);
            Route::post('programs/{program}/apply', [ProgramApplicationController::class, 'store']);
        });

        // ── Technician-only routes ──────────────────────────────
        Route::middleware('role:technician')->prefix('technician')->group(function () {
            Route::get('incidents', [TechnicianIncidentController::class, 'index']);
            Route::get('incidents/{incident}', [TechnicianIncidentController::class, 'show']);
            Route::put('incidents/{incident}/status', [TechnicianIncidentController::class, 'updateStatus']);
            Route::post('incidents/{incident}/recommendations', [TechnicianIncidentController::class, 'storeRecommendation']);

            // Scoped to only this technician's own assigned incidents —
            // see GisController::scopedFilters().
            Route::get('gis/map-points', [GisController::class, 'mapPoints']);
            Route::get('gis/heatmap', [GisController::class, 'heatmap']);
        });

        // ── Municipal Agriculture Office routes ─────────────────
        Route::middleware('role:municipal_office')->prefix('mao')->group(function () {
            Route::get('dashboard', [MaoDashboardController::class, 'index']);
            Route::get('gis/map-points', [GisController::class, 'mapPoints']);
            Route::get('gis/heatmap', [GisController::class, 'heatmap']);

            Route::get('incidents', [MaoIncidentController::class, 'index']);
            Route::get('incidents/{incident}', [MaoIncidentController::class, 'show']);
            Route::put('incidents/{incident}/validate', [MaoIncidentController::class, 'validateIncident']);
            Route::put('incidents/{incident}/reject', [MaoIncidentController::class, 'reject']);
            Route::post('incidents/{incident}/assign', [MaoIncidentController::class, 'assign']);
            Route::get('technicians', [TechnicianController::class, 'index']);
            Route::get('farmers', [MaoFarmerController::class, 'index']);
            Route::get('farmers/{farmer}', [MaoFarmerController::class, 'show']);

            Route::post('announcements', [AnnouncementController::class, 'store']);
            Route::post('announcements/{announcement}/archive', [AnnouncementController::class, 'archive']);
            Route::post('announcements/{id}/restore', [AnnouncementController::class, 'restore']);
            Route::post('advisories', [AdvisoryController::class, 'store']);
            Route::post('advisories/{advisory}/archive', [AdvisoryController::class, 'archive']);
            Route::post('advisories/{id}/restore', [AdvisoryController::class, 'restore']);

            Route::post('community/posts', [CommunityPostController::class, 'store']);
            Route::post('community/posts/{communityPost}/archive', [CommunityPostController::class, 'archive']);
            Route::post('community/posts/{id}/restore', [CommunityPostController::class, 'restore']);
            Route::post('municipality-documents', [MunicipalityDocumentController::class, 'store']);
            Route::post('municipality-documents/{document}/archive', [MunicipalityDocumentController::class, 'archive']);
            Route::post('municipality-documents/{id}/restore', [MunicipalityDocumentController::class, 'restore']);

            Route::put('program-applications/{application}/status', [ProgramApplicationController::class, 'updateStatus']);
            Route::post('reports/incidents/export', [ReportController::class, 'exportIncidents']);
        });

        // ── Provincial Agriculture Office routes ────────────────
        Route::middleware('role:provincial_office')->prefix('ppo')->group(function () {
            Route::get('dashboard', [PpoDashboardController::class, 'index']);
            Route::get('gis/map-points', [GisController::class, 'mapPoints']);
            Route::get('gis/heatmap', [GisController::class, 'heatmap']);

            Route::get('municipalities', [PpoMunicipalityController::class, 'index']);
            Route::get('municipalities/{municipality}', [PpoMunicipalityController::class, 'show']);

            Route::post('announcements', [AnnouncementController::class, 'store']);
            Route::post('announcements/{announcement}/archive', [AnnouncementController::class, 'archive']);
            Route::post('announcements/{id}/restore', [AnnouncementController::class, 'restore']);
            Route::post('advisories', [AdvisoryController::class, 'store']);
            Route::post('advisories/{advisory}/archive', [AdvisoryController::class, 'archive']);
            Route::post('advisories/{id}/restore', [AdvisoryController::class, 'restore']);

            Route::post('community/posts', [CommunityPostController::class, 'store']);
            Route::post('community/posts/{communityPost}/archive', [CommunityPostController::class, 'archive']);
            Route::post('community/posts/{id}/restore', [CommunityPostController::class, 'restore']);
            Route::post('municipality-documents', [MunicipalityDocumentController::class, 'store']);
            Route::post('municipality-documents/{document}/archive', [MunicipalityDocumentController::class, 'archive']);
            Route::post('municipality-documents/{id}/restore', [MunicipalityDocumentController::class, 'restore']);

            Route::post('programs', [ProgramController::class, 'store']);
            Route::post('programs/{program}/archive', [ProgramController::class, 'archive']);
            Route::post('programs/{id}/restore', [ProgramController::class, 'restore']);
            Route::put('program-applications/{application}/status', [ProgramApplicationController::class, 'updateStatus']);

            Route::post('reports/incidents/export', [ReportController::class, 'exportIncidents']);
        });

        // ── Admin-only routes ────────────────────────────────────
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('dashboard', [PpoDashboardController::class, 'index']);
            Route::get('gis/map-points', [GisController::class, 'mapPoints']);
            Route::get('gis/heatmap', [GisController::class, 'heatmap']);

            Route::get('users', [AdminUserController::class, 'index']);
            Route::post('users', [AdminUserController::class, 'store']);
            Route::get('users/{user}', [AdminUserController::class, 'show']);
            Route::put('users/{user}/status', [AdminUserController::class, 'updateStatus']);
            Route::post('users/{user}/archive', [AdminUserController::class, 'archive']);
            Route::post('users/{id}/restore', [AdminUserController::class, 'restore']);

            Route::get('audit-logs', [AuditLogController::class, 'index']);
            Route::get('audit-logs/filters', [AuditLogController::class, 'filters']);
            Route::get('audit-logs/export', [AuditLogController::class, 'export']);

            Route::post('announcements', [AnnouncementController::class, 'store']);
            Route::post('announcements/{announcement}/archive', [AnnouncementController::class, 'archive']);
            Route::post('announcements/{id}/restore', [AnnouncementController::class, 'restore']);
            Route::post('advisories', [AdvisoryController::class, 'store']);
            Route::post('advisories/{advisory}/archive', [AdvisoryController::class, 'archive']);
            Route::post('advisories/{id}/restore', [AdvisoryController::class, 'restore']);

            Route::post('community/posts', [CommunityPostController::class, 'store']);
            Route::post('community/posts/{communityPost}/archive', [CommunityPostController::class, 'archive']);
            Route::post('community/posts/{id}/restore', [CommunityPostController::class, 'restore']);
            Route::post('municipality-documents', [MunicipalityDocumentController::class, 'store']);
            Route::post('municipality-documents/{document}/archive', [MunicipalityDocumentController::class, 'archive']);
            Route::post('municipality-documents/{id}/restore', [MunicipalityDocumentController::class, 'restore']);

            Route::post('programs', [ProgramController::class, 'store']);
            Route::post('programs/{program}/archive', [ProgramController::class, 'archive']);
            Route::post('programs/{id}/restore', [ProgramController::class, 'restore']);
            Route::put('program-applications/{application}/status', [ProgramApplicationController::class, 'updateStatus']);

            Route::post('reports/incidents/export', [ReportController::class, 'exportIncidents']);
        });
    });
});
